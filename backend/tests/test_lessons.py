from datetime import datetime, timezone

from app import create_app
from app.extensions import db
from app.models.concept import Concept
from app.models.concept_text import ConceptText
from app.models.language import Language
from app.models.lesson import Lesson
from app.models.lesson_item import LessonItem


def make_concept_ready(concept_key, statuses_by_language_code=None):
    concept = Concept.query.filter_by(key=concept_key).first()
    if statuses_by_language_code is None:
        statuses_by_language_code = {"en": "approved", "fr": "approved", "med": "approved"}

    languages_by_code = {
        language.code: language
        for language in Language.query.filter(Language.code.in_(statuses_by_language_code.keys())).all()
    }

    for language_code, review_status in statuses_by_language_code.items():
        language = languages_by_code[language_code]
        existing = ConceptText.query.filter_by(
            concept_id=concept.id,
            language_id=language.id,
        ).first()
        if existing is not None:
            existing.status = "active"
            existing.review_status = review_status
            continue

        db.session.add(
            ConceptText(
                concept_id=concept.id,
                language_id=language.id,
                text=f"{concept.title} {language.code}",
                status="active",
                review_status=review_status,
            )
        )

    concept.status = "active"
    concept.published_at = None
    db.session.commit()
    return concept


def auth_headers(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@sounglah.com", "password": "password"},
    )
    token = response.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


def create_lesson(client, headers, **overrides):
    payload = {
        "title": "Greeting Grandma",
        "slug": "Greeting Grandma",
        "description": "Learn how to greet grandma with love and respect.",
        "difficulty": "beginner",
        "estimatedMinutes": 5,
        "status": "draft",
        "orderIndex": 1,
    }
    payload.update(overrides)
    return client.post("/api/admin/lessons", headers=headers, json=payload)


def test_lessons_require_admin_authentication():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.get("/api/admin/lessons")

    assert response.status_code == 401
    assert response.get_json() == {
        "error": {"message": "Admin authentication is required."}
    }


def test_create_lesson_normalizes_slug_and_defaults():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    response = create_lesson(client, headers)

    assert response.status_code == 201
    lesson = response.get_json()["data"]
    assert lesson["title"] == "Greeting Grandma"
    assert lesson["slug"] == "greeting-grandma"
    assert lesson["description"] == "Learn how to greet grandma with love and respect."
    assert lesson["difficulty"] == "beginner"
    assert lesson["estimatedMinutes"] == 5
    assert lesson["status"] == "draft"
    assert lesson["orderIndex"] == 1
    assert lesson["itemCount"] == 0
    assert lesson["coverImageUrl"] is None


def test_create_lesson_rejects_duplicate_slug():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    create_lesson(client, headers)
    response = create_lesson(
        client,
        headers,
        title="Another Lesson",
        slug="greeting-grandma",
    )

    assert response.status_code == 400
    assert response.get_json()["error"]["fields"]["slug"] == "Lesson slug already exists."


def test_list_and_get_lesson_with_search_and_filters():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    create_response = create_lesson(client, headers)
    lesson_id = create_response.get_json()["data"]["id"]

    list_response = client.get("/api/admin/lessons?search=grandma", headers=headers)
    assert list_response.status_code == 200
    listed = list_response.get_json()
    assert listed["meta"]["total"] == 1
    assert listed["data"][0]["slug"] == "greeting-grandma"

    get_response = client.get(f"/api/admin/lessons/{lesson_id}", headers=headers)
    assert get_response.status_code == 200
    assert get_response.get_json()["data"]["id"] == lesson_id

    empty_search = client.get("/api/admin/lessons?search=missing", headers=headers)
    assert empty_search.get_json()["meta"]["total"] == 0

    draft_filter = client.get("/api/admin/lessons?status=draft&difficulty=beginner", headers=headers)
    assert draft_filter.get_json()["meta"]["total"] == 1


def test_update_and_delete_lesson():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    lesson_id = create_lesson(client, headers).get_json()["data"]["id"]

    update_response = client.patch(
        f"/api/admin/lessons/{lesson_id}",
        headers=headers,
        json={
            "title": "Updated Greeting Grandma",
            "description": "Updated description.",
            "estimatedMinutes": 4,
            "orderIndex": 2,
            "coverImageUrl": "https://example.com/cover.jpg",
            "coverImageAltText": "Child greeting grandmother",
        },
    )

    assert update_response.status_code == 200
    updated = update_response.get_json()["data"]
    assert updated["title"] == "Updated Greeting Grandma"
    assert updated["estimatedMinutes"] == 4
    assert updated["orderIndex"] == 2
    assert updated["coverImageUrl"] == "https://example.com/cover.jpg"
    assert updated["coverImageAltText"] == "Child greeting grandmother"

    delete_response = client.delete(f"/api/admin/lessons/{lesson_id}", headers=headers)
    assert delete_response.status_code == 204
    assert delete_response.get_data(as_text=True) == ""

    missing_response = client.get(f"/api/admin/lessons/{lesson_id}", headers=headers)
    assert missing_response.status_code == 404


def test_publish_lesson_requires_active_items():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    lesson_id = create_lesson(client, headers).get_json()["data"]["id"]

    response = client.patch(
        f"/api/admin/lessons/{lesson_id}",
        headers=headers,
        json={"status": "published"},
    )

    assert response.status_code == 400
    error = response.get_json()["error"]
    assert "curriculum requirements" in error["message"]
    assert error["fields"]["status"] == "Published lesson must have at least one active item."


def test_publish_lesson_requires_ready_concepts():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    with app.app_context():
        lesson = Lesson(
            title="Greeting Grandma",
            slug="greeting-grandma",
            difficulty="beginner",
            status="draft",
            order_index=1,
        )
        db.session.add(lesson)
        db.session.flush()

        concept = Concept.query.filter_by(key="greeting").first()
        db.session.add(
            LessonItem(
                lesson_id=lesson.id,
                type="VOCABULARY",
                concept_id=concept.id,
                title="Hello",
                order_index=1,
            )
        )
        db.session.commit()
        lesson_id = lesson.id

    response = client.patch(
        f"/api/admin/lessons/{lesson_id}",
        headers=headers,
        json={"status": "published"},
    )

    assert response.status_code == 400
    items_errors = response.get_json()["error"]["fields"]["items"]
    assert any("not ready to publish" in message for message in items_errors)


def test_publish_lesson_auto_publishes_complete_concepts():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    with app.app_context():
        lesson = Lesson(
            title="Greeting Grandma",
            slug="greeting-grandma",
            difficulty="beginner",
            status="draft",
            order_index=1,
        )
        db.session.add(lesson)
        db.session.flush()

        concept = make_concept_ready("greeting")
        assert concept.published_at is None

        db.session.add(
            LessonItem(
                lesson_id=lesson.id,
                type="VOCABULARY",
                concept_id=concept.id,
                title="Hello",
                order_index=1,
            )
        )
        db.session.commit()
        lesson_id = lesson.id
        concept_id = concept.id

    response = client.patch(
        f"/api/admin/lessons/{lesson_id}",
        headers=headers,
        json={"status": "published"},
    )

    assert response.status_code == 200
    published = response.get_json()["data"]
    assert published["status"] == "published"

    with app.app_context():
        concept = db.session.get(Concept, concept_id)
        assert concept.published_at is not None


def test_publish_lesson_when_curriculum_is_ready():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    with app.app_context():
        lesson = Lesson(
            title="Greeting Grandma",
            slug="greeting-grandma",
            difficulty="beginner",
            status="draft",
            order_index=1,
        )
        db.session.add(lesson)
        db.session.flush()

        concept = Concept.query.filter_by(key="greeting").first()
        concept.published_at = datetime.now(timezone.utc)
        db.session.add(
            LessonItem(
                lesson_id=lesson.id,
                type="VOCABULARY",
                concept_id=concept.id,
                title="Hello",
                order_index=1,
            )
        )
        db.session.commit()
        lesson_id = lesson.id

    response = client.patch(
        f"/api/admin/lessons/{lesson_id}",
        headers=headers,
        json={"status": "published"},
    )

    assert response.status_code == 200
    published = response.get_json()["data"]
    assert published["status"] == "published"
    assert published["itemCount"] == 1


def test_list_lessons_supports_sort_options():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    create_lesson(client, headers, title="Alpha Lesson", slug="alpha-lesson", orderIndex=2)
    create_lesson(client, headers, title="Beta Lesson", slug="beta-lesson", orderIndex=1)

    title_sort = client.get("/api/admin/lessons?sort=title", headers=headers)
    assert [lesson["slug"] for lesson in title_sort.get_json()["data"]] == [
        "alpha-lesson",
        "beta-lesson",
    ]

    order_sort = client.get("/api/admin/lessons?sort=orderIndex", headers=headers)
    assert [lesson["slug"] for lesson in order_sort.get_json()["data"]] == [
        "beta-lesson",
        "alpha-lesson",
    ]
