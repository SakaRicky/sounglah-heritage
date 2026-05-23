from datetime import datetime, timezone

from app.models.lesson_item import CONCEPT_BACKED_ITEM_TYPES
from app.services.concept_completion_service import concept_completion_for


def auto_publish_ready_concepts_for_lesson(lesson):
    """Publish complete-but-unpublished concepts linked by active lesson items."""
    published_concept_ids = []

    for item in lesson.items:
        if not item.is_active or item.type not in CONCEPT_BACKED_ITEM_TYPES or not item.concept_id:
            continue

        concept = item.concept
        if concept is None or concept.published_at is not None:
            continue

        completion = concept_completion_for(concept)
        if not completion["isReadyToPublish"]:
            continue

        concept.published_at = datetime.now(timezone.utc)
        published_concept_ids.append(concept.id)

    return published_concept_ids


def _concept_not_ready_message(item, concept):
    completion = concept_completion_for(concept)
    detail_parts = []

    if completion["missingLanguages"]:
        detail_parts.append(f"missing {', '.join(completion['missingLanguages'])}")
    if completion["draftLanguages"]:
        detail_parts.append(f"draft {', '.join(completion['draftLanguages'])}")
    if completion["needsReviewLanguages"]:
        detail_parts.append(f"needs review {', '.join(completion['needsReviewLanguages'])}")
    if completion.get("needsAudioLanguages"):
        detail_parts.append(f"needs approved audio {', '.join(completion['needsAudioLanguages'])}")
    if completion["rejectedLanguages"]:
        detail_parts.append(f"rejected {', '.join(completion['rejectedLanguages'])}")

    if detail_parts:
        details = "; ".join(detail_parts)
        return (
            f'Item "{item.title}" links concept "{concept.title}" ({concept.key}) '
            f"that is not ready to publish: {details}."
        )

    return (
        f'Item "{item.title}" links concept "{concept.title}" ({concept.key}) '
        "that must be published in Concept Completion before this lesson can go live."
    )


def validate_lesson_items_for_publish(items):
    """Return field-level errors when lesson items block publish."""
    fields = {}
    active_items = [item for item in items if item.is_active]

    if not active_items:
        fields["status"] = "Published lesson must have at least one active item."
        return fields

    for item in active_items:
        if item.type not in CONCEPT_BACKED_ITEM_TYPES:
            continue

        if not item.concept_id:
            fields.setdefault("items", []).append(
                f'Item "{item.title}" requires a linked concept before publish.'
            )
            continue

        concept = item.concept
        if concept is None or concept.published_at is None:
            if concept is None:
                fields.setdefault("items", []).append(
                    f'Item "{item.title}" links a concept that no longer exists.'
                )
            else:
                fields.setdefault("items", []).append(_concept_not_ready_message(item, concept))

    return fields


def validate_lesson_publish(lesson):
    return validate_lesson_items_for_publish(lesson.items)


def prepare_lesson_for_publish(lesson):
    """Auto-publish ready concepts, then return any remaining publish blockers."""
    auto_publish_ready_concepts_for_lesson(lesson)
    return validate_lesson_publish(lesson)
