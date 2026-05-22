from datetime import datetime, timezone

from app.services.lesson_publish_service import validate_lesson_items_for_publish


class _ConceptStub:
    def __init__(self, published_at=None):
        self.published_at = published_at


class _ItemStub:
    def __init__(self, title, item_type, concept_id=None, concept=None, is_active=True):
        self.title = title
        self.type = item_type
        self.concept_id = concept_id
        self.concept = concept
        self.is_active = is_active


def test_validate_lesson_publish_requires_active_items():
    errors = validate_lesson_items_for_publish([])

    assert errors == {"status": "Published lesson must have at least one active item."}


def test_validate_lesson_publish_requires_published_concepts():
    errors = validate_lesson_items_for_publish(
        [
            _ItemStub(
                "Hello",
                "VOCABULARY",
                concept_id="concept-id",
                concept=_ConceptStub(published_at=None),
            )
        ]
    )

    assert "items" in errors
    assert "not published yet" in errors["items"][0]


def test_validate_lesson_publish_allows_cultural_note_without_concept():
    assert (
        validate_lesson_items_for_publish(
            [
                _ItemStub(
                    "Culture",
                    "CULTURAL_NOTE",
                    concept_id=None,
                    concept=None,
                )
            ]
        )
        == {}
    )


def test_validate_lesson_publish_passes_when_concept_is_published():
    assert (
        validate_lesson_items_for_publish(
            [
                _ItemStub(
                    "Hello",
                    "VOCABULARY",
                    concept_id="concept-id",
                    concept=_ConceptStub(published_at=datetime.now(timezone.utc)),
                )
            ]
        )
        == {}
    )
