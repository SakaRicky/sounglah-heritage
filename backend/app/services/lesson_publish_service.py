from app.models.lesson_item import CONCEPT_BACKED_ITEM_TYPES


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
            fields.setdefault("items", []).append(
                f'Item "{item.title}" links a concept that is not published yet.'
            )

    return fields


def validate_lesson_publish(lesson):
    return validate_lesson_items_for_publish(lesson.items)
