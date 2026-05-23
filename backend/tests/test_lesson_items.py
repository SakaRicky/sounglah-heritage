from app import create_app
from app.extensions import db
from app.models.concept import Concept
from app.models.concept_text import ConceptText
from app.models.concept_text_audio import ConceptTextAudio
from app.models.language import Language
from app.models.lesson_item import LessonItem


def auth_headers(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@sounglah.com", "password": "password"},
    )
    token = response.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


def create_lesson(client, headers):
    response = client.post(
        "/api/admin/lessons",
        headers=headers,
        json={
            "title": "Greeting Grandma",
            "slug": "greeting-grandma",
            "difficulty": "beginner",
            "status": "draft",
            "orderIndex": 1,
        },
    )
    return response.get_json()["data"]["id"]


def seeded_concept():
    return Concept.query.filter_by(key="greeting").first()


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
    db.session.commit()

    medumba_status = statuses_by_language_code.get("med")
    if medumba_status == "approved":
        medumba = Language.query.filter_by(code="med").first()
        medumba_text = ConceptText.query.filter_by(
            concept_id=concept.id,
            language_id=medumba.id,
        ).first()
        if medumba_text.current_audio is None:
            audio = ConceptTextAudio(
                concept_text_id=medumba_text.id,
                audio_url=f"https://cdn.example.com/{medumba_text.id}.webm",
                status=ConceptTextAudio.STATUS_APPROVED,
                duration_seconds=3,
                mime_type="audio/webm",
            )
            db.session.add(audio)
            db.session.flush()
            medumba_text.set_current_audio(audio)
            db.session.commit()

    return concept


def create_item(client, headers, lesson_id, app, **overrides):
    payload = {
        "type": "VOCABULARY",
        "title": "Grandma",
    }
    item_type = overrides.get("type", payload["type"])
    if item_type in {"VOCABULARY", "PHRASE", "AUDIO_LISTEN"} and "conceptId" not in overrides:
        with app.app_context():
            concept = make_concept_ready("greeting")
            payload["conceptId"] = concept.id
    payload.update(overrides)
    return client.post(f"/api/admin/lessons/{lesson_id}/items", headers=headers, json=payload)


def test_lesson_items_require_admin_authentication():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.get("/api/admin/lessons/lesson-id/items")

    assert response.status_code == 401


def test_create_vocabulary_requires_concept_id():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    lesson_id = create_lesson(client, headers)

    response = create_item(client, headers, lesson_id, app, conceptId=None, type="VOCABULARY")

    assert response.status_code == 400
    assert response.get_json()["error"]["fields"]["conceptId"] == "Concept is required for this item type."


def test_create_cultural_note_requires_bilingual_note_text():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    lesson_id = create_lesson(client, headers)

    response = create_item(
        client,
        headers,
        lesson_id,
        app,
        type="CULTURAL_NOTE",
        conceptId=None,
        title="Greeting Elders",
        contentJson={},
    )

    assert response.status_code == 400
    fields = response.get_json()["error"]["fields"]
    assert "contentJson.noteTextEn" in fields
    assert "contentJson.noteTextFr" in fields


def test_create_and_list_lesson_items_in_order():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    lesson_id = create_lesson(client, headers)
    with app.app_context():
        make_concept_ready("greeting")
        concept_key = "greeting"

    first = create_item(client, headers, lesson_id, app, title="Grandma", orderIndex=1).get_json()["data"]
    second = create_item(
        client,
        headers,
        lesson_id,
        app,
        type="PHRASE",
        title="Hello Grandma",
    ).get_json()["data"]
    third = create_item(
        client,
        headers,
        lesson_id,
        app,
        type="CULTURAL_NOTE",
        conceptId=None,
        title="Respect",
        contentJson={
            "noteTextEn": "Greeting shows love and respect.",
            "noteTextFr": "Saluer montre l'amour et le respect.",
        },
    ).get_json()["data"]

    assert first["orderIndex"] == 1
    assert second["orderIndex"] == 2
    assert third["type"] == "CULTURAL_NOTE"
    assert third["contentJson"]["noteTextEn"] == "Greeting shows love and respect."

    list_response = client.get(f"/api/admin/lessons/{lesson_id}/items", headers=headers)
    listed = list_response.get_json()["data"]

    assert [item["title"] for item in listed] == ["Grandma", "Hello Grandma", "Respect"]
    assert listed[0]["concept"]["key"] == concept_key
    assert "completionStatus" in listed[0]["concept"]


def test_create_item_rejects_incomplete_concept():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    lesson_id = create_lesson(client, headers)

    with app.app_context():
        concept = seeded_concept()
        concept_id = concept.id

    response = create_item(client, headers, lesson_id, app, conceptId=concept_id)

    assert response.status_code == 400
    assert (
        response.get_json()["error"]["fields"]["conceptId"]
        == "Concept is missing required translations or approvals. "
        "Finish concept completion before linking it to a lesson item."
    )


def test_update_item_allows_keeping_existing_incomplete_concept():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    lesson_id = create_lesson(client, headers)

    with app.app_context():
        concept = seeded_concept()
        concept_id = concept.id
        db.session.add(
            LessonItem(
                lesson_id=lesson_id,
                type="VOCABULARY",
                concept_id=concept_id,
                title="Legacy greeting",
                order_index=1,
                is_active=True,
            )
        )
        db.session.commit()
        item_id = LessonItem.query.filter_by(lesson_id=lesson_id).first().id

    response = client.patch(
        f"/api/admin/lesson-items/{item_id}",
        headers=headers,
        json={"title": "Legacy greeting updated"},
    )

    assert response.status_code == 200
    assert response.get_json()["data"]["title"] == "Legacy greeting updated"


def test_update_item_rejects_switching_to_incomplete_concept():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    lesson_id = create_lesson(client, headers)

    with app.app_context():
        ready_concept = make_concept_ready("greeting")
        incomplete_concept = Concept.query.filter_by(key="mother").first()
        ready_concept_id = ready_concept.id
        incomplete_concept_id = incomplete_concept.id

    item_id = create_item(client, headers, lesson_id, app, conceptId=ready_concept_id).get_json()["data"]["id"]

    response = client.patch(
        f"/api/admin/lesson-items/{item_id}",
        headers=headers,
        json={"conceptId": incomplete_concept_id},
    )

    assert response.status_code == 400
    assert "conceptId" in response.get_json()["error"]["fields"]


def test_create_item_rejects_disabled_concept():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    lesson_id = create_lesson(client, headers)

    with app.app_context():
        concept = seeded_concept()
        concept.status = "disabled"
        db.session.commit()
        concept_id = concept.id

    response = create_item(client, headers, lesson_id, app, conceptId=concept_id)

    assert response.status_code == 400
    assert response.get_json()["error"]["fields"]["conceptId"] == "Cannot link a disabled concept."


def test_update_lesson_item():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    lesson_id = create_lesson(client, headers)
    item_id = create_item(client, headers, lesson_id, app).get_json()["data"]["id"]

    response = client.patch(
        f"/api/admin/lesson-items/{item_id}",
        headers=headers,
        json={"title": "Grandmother", "instructionText": "Say this warmly."},
    )

    assert response.status_code == 200
    updated = response.get_json()["data"]
    assert updated["title"] == "Grandmother"
    assert updated["instructionText"] == "Say this warmly."


def test_reorder_lesson_items():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    lesson_id = create_lesson(client, headers)

    create_item(client, headers, lesson_id, app, title="First").get_json()["data"]["id"]
    second_id = create_item(client, headers, lesson_id, app, title="Second").get_json()["data"]["id"]

    response = client.patch(
        f"/api/admin/lesson-items/{second_id}/reorder",
        headers=headers,
        json={"direction": "up"},
    )

    assert response.status_code == 200
    listed = response.get_json()["data"]
    assert [item["title"] for item in listed] == ["Second", "First"]
    assert listed[0]["id"] == second_id


def test_delete_lesson_item_compacts_order_indices():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    lesson_id = create_lesson(client, headers)

    first_id = create_item(client, headers, lesson_id, app, title="First").get_json()["data"]["id"]
    create_item(client, headers, lesson_id, app, title="Second")
    create_item(client, headers, lesson_id, app, title="Third")

    response = client.delete(f"/api/admin/lesson-items/{first_id}", headers=headers)

    assert response.status_code == 200
    listed = response.get_json()["data"]
    assert [item["title"] for item in listed] == ["Second", "Third"]
    assert [item["orderIndex"] for item in listed] == [1, 2]


def test_audio_listen_defaults_hide_text_until_played():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    lesson_id = create_lesson(client, headers)

    response = create_item(
        client,
        headers,
        lesson_id,
        app,
        type="AUDIO_LISTEN",
        title="Listen",
    )

    assert response.status_code == 201
    assert response.get_json()["data"]["contentJson"] == {"hideTextUntilPlayed": True}


def test_concept_enrichment_includes_completion_status():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    lesson_id = create_lesson(client, headers)

    with app.app_context():
        make_concept_ready("greeting")
        concept_key = "greeting"

    response = create_item(client, headers, lesson_id, app)
    item = response.get_json()["data"]

    assert item["concept"]["key"] == concept_key
    assert item["concept"]["id"]
    assert isinstance(item["concept"]["completionStatus"], str)
