from datetime import datetime, timezone
from unittest.mock import patch

from app.services.lesson_publish_service import validate_lesson_items_for_publish


class _ConceptStub:
    def __init__(self, published_at=None, title="Greeting", key="greeting"):
        self.published_at = published_at
        self.title = title
        self.key = key
        self.id = "concept-id"


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


def test_validate_lesson_publish_requires_ready_concepts():
    completion = {
        "isReadyToPublish": False,
        "missingLanguages": ["med"],
        "draftLanguages": [],
        "needsReviewLanguages": [],
        "rejectedLanguages": [],
    }

    with patch(
        "app.services.lesson_publish_service.concept_completion_for",
        return_value=completion,
    ):
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
    assert "not ready to publish" in errors["items"][0]
    assert "missing med" in errors["items"][0]


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
