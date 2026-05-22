from datetime import datetime, timezone

from app import create_app
from app.extensions import db
from app.models.concept import Concept
from app.models.concept_text import ConceptText
from app.models.concept_text_audio import ConceptTextAudio
from app.models.language import Language
from app.models.lesson import Lesson
from app.models.lesson_item import LessonItem


def make_concept_texts_ready(concept):
    languages = {
        language.code: language
        for language in Language.query.filter(Language.code.in_(["en", "fr", "med"])).all()
    }

    texts = {}
    for code in ("en", "fr", "med"):
        language = languages[code]
        concept_text = ConceptText.query.filter_by(
            concept_id=concept.id,
            language_id=language.id,
        ).first()
        if concept_text is None:
            concept_text = ConceptText(
                concept_id=concept.id,
                language_id=language.id,
                text=f"{concept.title} ({code})",
                pronunciation=f"pron-{code}" if code == "med" else None,
                status="active",
                review_status="approved",
            )
            db.session.add(concept_text)
        else:
            concept_text.text = f"{concept.title} ({code})"
            concept_text.pronunciation = f"pron-{code}" if code == "med" else None
            concept_text.status = "active"
            concept_text.review_status = "approved"

        texts[code] = concept_text

    db.session.flush()

    med_text = texts["med"]
    approved_audio = ConceptTextAudio(
        concept_text_id=med_text.id,
        audio_url="https://example.com/med-audio.mp3",
        status=ConceptTextAudio.STATUS_APPROVED,
    )
    db.session.add(approved_audio)
    db.session.flush()
    med_text.set_current_audio(approved_audio)

    concept.published_at = datetime.now(timezone.utc)
    concept.status = "active"
    db.session.commit()
    return concept


def seed_published_lesson(*, slug="greeting-grandma", status="published", with_inactive_item=False):
    lesson = Lesson(
        title="Greeting Grandma",
        slug=slug,
        description="Learn how to greet grandma with love and respect.",
        difficulty="beginner",
        estimated_minutes=5,
        cover_image_url="https://example.com/cover.jpg",
        cover_image_alt_text="Child greeting grandmother",
        status=status,
        order_index=1,
    )
    db.session.add(lesson)
    db.session.flush()

    concept = Concept.query.filter_by(key="greeting").first()
    make_concept_texts_ready(concept)

    db.session.add(
        LessonItem(
            lesson_id=lesson.id,
            type="VOCABULARY",
            concept_id=concept.id,
            title="Hello",
            order_index=1,
            is_active=True,
        )
    )
    db.session.add(
        LessonItem(
            lesson_id=lesson.id,
            type="CULTURAL_NOTE",
            title="Greeting Elders",
            order_index=2,
            is_active=True,
            content_json={
                "noteTextEn": "Greeting elders shows love and respect.",
                "noteTextFr": "Saluer les aînés montre l'amour et le respect.",
            },
        )
    )
    if with_inactive_item:
        db.session.add(
            LessonItem(
                lesson_id=lesson.id,
                type="VOCABULARY",
                concept_id=concept.id,
                title="Hidden step",
                order_index=3,
                is_active=False,
            )
        )

    db.session.commit()
    return lesson


def test_public_lessons_list_excludes_drafts():
    app = create_app(testing=True)
    client = app.test_client()

    with app.app_context():
        seed_published_lesson(status="published", slug="published-lesson")
        seed_published_lesson(status="draft", slug="draft-lesson")

    response = client.get("/api/lessons")

    assert response.status_code == 200
    data = response.get_json()["data"]
    assert len(data) == 1
    assert data[0]["slug"] == "published-lesson"
    assert data[0]["activeItemCount"] == 2


def test_public_lesson_detail_returns_404_for_draft():
    app = create_app(testing=True)
    client = app.test_client()

    with app.app_context():
        seed_published_lesson(status="draft", slug="draft-only")

    response = client.get("/api/lessons/draft-only")

    assert response.status_code == 404
    assert response.get_json()["error"]["message"] == "Lesson not found."


def test_public_lesson_detail_returns_active_items_and_concept_payload():
    app = create_app(testing=True)
    client = app.test_client()

    with app.app_context():
        seed_published_lesson(with_inactive_item=True)

    response = client.get("/api/lessons/greeting-grandma")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["slug"] == "greeting-grandma"
    assert payload["estimatedMinutes"] == 5
    assert len(payload["items"]) == 2
    assert [item["orderIndex"] for item in payload["items"]] == [1, 2]

    vocabulary_item = payload["items"][0]
    assert vocabulary_item["type"] == "VOCABULARY"
    concept_payload = vocabulary_item["conceptPayload"]
    assert concept_payload["key"] == "greeting"
    assert concept_payload["texts"]["en"]["text"] == "Greeting (en)"
    assert concept_payload["texts"]["fr"]["text"] == "Greeting (fr)"
    assert concept_payload["texts"]["med"]["text"] == "Greeting (med)"
    assert concept_payload["texts"]["med"]["audioUrl"] == "https://example.com/med-audio.mp3"
    assert concept_payload["texts"]["med"]["hasApprovedAudio"] is True
    assert "hasApprovedAudio" not in concept_payload["texts"]["en"]

    cultural_item = payload["items"][1]
    assert cultural_item["type"] == "CULTURAL_NOTE"
    assert cultural_item["conceptPayload"] is None
    assert cultural_item["contentJson"]["noteTextEn"] == "Greeting elders shows love and respect."


def test_public_lessons_endpoints_do_not_require_auth():
    app = create_app(testing=True)
    client = app.test_client()

    list_response = client.get("/api/lessons")
    detail_response = client.get("/api/lessons/missing-lesson")

    assert list_response.status_code == 200
    assert detail_response.status_code == 404
