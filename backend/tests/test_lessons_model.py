import pytest
from sqlalchemy.exc import IntegrityError

from app import create_app
from app.extensions import db
from app.models.concept import Concept
from app.models.lesson import Lesson
from app.models.lesson_item import (
    LessonItem,
    validate_cultural_note_content_json,
    validate_lesson_item_concept_id,
)


@pytest.fixture
def app():
    application = create_app(testing=True)
    with application.app_context():
        yield application


def _create_lesson(slug="greeting-grandma", title="Greeting Grandma"):
    lesson = Lesson(
        title=title,
        slug=slug,
        description="Learn how to greet grandma with love and respect.",
        difficulty="beginner",
        estimated_minutes=5,
        status="draft",
        order_index=1,
    )
    db.session.add(lesson)
    db.session.commit()
    return lesson


def _seeded_concept():
    return Concept.query.filter_by(key="greeting").first()


def test_models_import_without_circular_dependencies():
    from app.models import Lesson, LessonItem  # noqa: F401

    assert Lesson.__tablename__ == "lessons"
    assert LessonItem.__tablename__ == "lesson_items"


def test_lesson_slug_must_be_unique(app):
    _create_lesson(slug="duplicate-slug")
    db.session.add(
        Lesson(
            title="Another Lesson",
            slug="duplicate-slug",
            difficulty="beginner",
            status="draft",
            order_index=2,
        )
    )

    with pytest.raises(IntegrityError):
        db.session.commit()

    db.session.rollback()


def test_lesson_item_order_index_unique_per_lesson(app):
    lesson = _create_lesson()
    concept = _seeded_concept()

    db.session.add(
        LessonItem(
            lesson_id=lesson.id,
            type="VOCABULARY",
            concept_id=concept.id,
            title="Grandma",
            order_index=1,
        )
    )
    db.session.commit()

    db.session.add(
        LessonItem(
            lesson_id=lesson.id,
            type="PHRASE",
            concept_id=concept.id,
            title="Hello Grandma",
            order_index=1,
        )
    )

    with pytest.raises(IntegrityError):
        db.session.commit()

    db.session.rollback()


def test_deleting_lesson_cascades_to_items(app):
    lesson = _create_lesson()
    concept = _seeded_concept()

    item = LessonItem(
        lesson_id=lesson.id,
        type="VOCABULARY",
        concept_id=concept.id,
        title="Grandma",
        order_index=1,
    )
    db.session.add(item)
    db.session.commit()

    item_id = item.id
    db.session.delete(lesson)
    db.session.commit()

    assert db.session.get(LessonItem, item_id) is None


def test_deleting_concept_referenced_by_item_is_restricted(app):
    lesson = _create_lesson()
    concept = _seeded_concept()

    db.session.add(
        LessonItem(
            lesson_id=lesson.id,
            type="VOCABULARY",
            concept_id=concept.id,
            title="Grandma",
            order_index=1,
        )
    )
    db.session.commit()

    db.session.delete(concept)

    with pytest.raises(IntegrityError):
        db.session.commit()

    db.session.rollback()


def test_validate_lesson_item_concept_id():
    assert validate_lesson_item_concept_id("VOCABULARY", None) == {
        "conceptId": "Concept is required for this item type."
    }
    assert validate_lesson_item_concept_id("PHRASE", "concept-id") == {}
    assert validate_lesson_item_concept_id("CULTURAL_NOTE", None) == {}


def test_validate_cultural_note_content_json():
    assert validate_cultural_note_content_json("VOCABULARY", {}) == {}

    errors = validate_cultural_note_content_json("CULTURAL_NOTE", {})
    assert "contentJson.noteTextEn" in errors
    assert "contentJson.noteTextFr" in errors

    assert validate_cultural_note_content_json(
        "CULTURAL_NOTE",
        {"noteTextEn": "Respect elders.", "noteTextFr": "Respectez les aînés."},
    ) == {}


def test_lesson_items_relationship(app):
    lesson = _create_lesson()
    concept = _seeded_concept()

    item = LessonItem(
        lesson_id=lesson.id,
        type="CULTURAL_NOTE",
        title="Greeting Elders",
        content_json={
            "noteTextEn": "Greeting shows love and respect.",
            "noteTextFr": "Saluer montre l'amour et le respect.",
        },
        order_index=1,
    )
    db.session.add(item)
    db.session.commit()

    db.session.refresh(lesson)
    assert len(lesson.items) == 1
    assert lesson.items[0].title == "Greeting Elders"
    assert item.lesson.slug == "greeting-grandma"
