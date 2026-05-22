from sqlalchemy import func

from app.extensions import db
from app.models.concept import Concept
from app.models.concept_text import ConceptText
from app.models.lesson_item import (
    CONCEPT_BACKED_ITEM_TYPES,
    LESSON_ITEM_TYPES,
    validate_cultural_note_content_json,
    validate_lesson_item_concept_id,
)
from app.services.concept_completion_service import (
    calculate_concept_completion,
    get_active_required_languages,
    is_concept_ready_for_lesson_items,
)

WRITABLE_FIELDS = {
    "type",
    "conceptId",
    "title",
    "instructionText",
    "contentJson",
    "orderIndex",
    "isActive",
}


def _optional_string(value):
    if value is None:
        return None

    normalized = str(value).strip()
    return normalized or None


def _normalize_content_json(value):
    if value is None:
        return {}

    if not isinstance(value, dict):
        return None

    return value


def _validate_type_specific_content(item_type, content_json):
    fields = {}
    content = content_json or {}

    fields.update(validate_cultural_note_content_json(item_type, content))

    if item_type == "PHRASE" and "usageNote" in content:
        usage_note = content.get("usageNote")
        if usage_note is not None and not isinstance(usage_note, str):
            fields["contentJson.usageNote"] = "Usage note must be a string."

    if item_type == "AUDIO_LISTEN" and "hideTextUntilPlayed" in content:
        hide_text = content.get("hideTextUntilPlayed")
        if not isinstance(hide_text, bool):
            fields["contentJson.hideTextUntilPlayed"] = "hideTextUntilPlayed must be true or false."

    return fields


def _validate_concept_link(item_type, concept_id, existing_item=None):
    fields = {}
    fields.update(validate_lesson_item_concept_id(item_type, concept_id))

    if not concept_id:
        return fields, None

    concept = db.session.get(Concept, concept_id)
    if concept is None:
        fields["conceptId"] = "Concept not found."
        return fields, None

    if concept.status == "disabled":
        fields["conceptId"] = "Cannot link a disabled concept."
    elif item_type in CONCEPT_BACKED_ITEM_TYPES:
        keeping_existing_concept = (
            existing_item is not None and existing_item.concept_id == concept_id
        )
        if not keeping_existing_concept and not is_concept_ready_for_lesson_items(concept):
            fields["conceptId"] = (
                "Concept is missing required translations or approvals. "
                "Finish concept completion before linking it to a lesson item."
            )

    if item_type in CONCEPT_BACKED_ITEM_TYPES:
        return fields, concept

    return fields, concept if concept_id else None


def validate_item_payload(data, existing_item=None, partial=False):
    fields = {}
    normalized = {}

    if not partial or "type" in data:
        item_type = str(data.get("type", "")).strip().upper()
        if item_type not in LESSON_ITEM_TYPES:
            fields["type"] = "Type must be VOCABULARY, PHRASE, AUDIO_LISTEN, or CULTURAL_NOTE."
        else:
            normalized["type"] = item_type
    else:
        item_type = existing_item.type

    if not partial or "title" in data:
        title = str(data.get("title", "")).strip()
        if not title:
            fields["title"] = "Title is required."
        else:
            normalized["title"] = title

    if "instructionText" in data:
        normalized["instructionText"] = _optional_string(data.get("instructionText"))

    concept_id = existing_item.concept_id if existing_item is not None else None
    if not partial or "conceptId" in data:
        raw_concept_id = data.get("conceptId")
        concept_id = str(raw_concept_id).strip() if raw_concept_id not in (None, "") else None
        normalized["conceptId"] = concept_id

    concept_fields, _concept = _validate_concept_link(item_type, concept_id, existing_item=existing_item)
    fields.update(concept_fields)

    content_json = existing_item.content_json if existing_item is not None else {}
    if "contentJson" in data:
        parsed_content = _normalize_content_json(data.get("contentJson"))
        if parsed_content is None:
            fields["contentJson"] = "Content must be a JSON object."
        else:
            content_json = parsed_content
            normalized["contentJson"] = content_json

    if item_type == "AUDIO_LISTEN" and "contentJson" not in normalized and not partial:
        content_json = {"hideTextUntilPlayed": True}
        normalized["contentJson"] = content_json

    fields.update(_validate_type_specific_content(item_type, content_json))

    if not partial or "orderIndex" in data:
        if "orderIndex" not in data and not partial:
            normalized["orderIndex"] = None
        else:
            order_index = data.get("orderIndex")
            if order_index is None:
                normalized["orderIndex"] = None
            else:
                try:
                    normalized["orderIndex"] = int(order_index)
                except (TypeError, ValueError):
                    fields["orderIndex"] = "Order index must be a number."
                else:
                    if normalized["orderIndex"] <= 0:
                        fields["orderIndex"] = "Order index must be a positive integer."

    if not partial or "isActive" in data:
        if "isActive" in data:
            is_active = data.get("isActive")
            if not isinstance(is_active, bool):
                fields["isActive"] = "isActive must be true or false."
            else:
                normalized["isActive"] = is_active
        elif not partial:
            normalized["isActive"] = True

    if fields:
        return None, fields

    return normalized, None


def apply_item_payload(item, payload):
    field_map = {
        "conceptId": "concept_id",
        "instructionText": "instruction_text",
        "contentJson": "content_json",
        "orderIndex": "order_index",
        "isActive": "is_active",
    }

    for key, value in payload.items():
        setattr(item, field_map.get(key, key), value)


def next_order_index(lesson_id):
    from app.models.lesson_item import LessonItem

    max_index = db.session.query(func.max(LessonItem.order_index)).filter(LessonItem.lesson_id == lesson_id).scalar()
    return (max_index or 0) + 1


def compact_order_indices(lesson_id):
    from app.models.lesson_item import LessonItem

    items = (
        LessonItem.query.filter_by(lesson_id=lesson_id)
        .order_by(LessonItem.order_index.asc(), LessonItem.created_at.asc())
        .all()
    )

    offset = 1000
    for index, item in enumerate(items, start=1):
        item.order_index = offset + index

    db.session.flush()

    for index, item in enumerate(items, start=1):
        item.order_index = index

    db.session.flush()


def reorder_item(item, direction):
    from app.models.lesson_item import LessonItem

    if direction not in {"up", "down"}:
        return {"direction": "Direction must be up or down."}

    items = (
        LessonItem.query.filter_by(lesson_id=item.lesson_id)
        .order_by(LessonItem.order_index.asc(), LessonItem.created_at.asc())
        .all()
    )

    current_index = next((index for index, row in enumerate(items) if row.id == item.id), None)
    if current_index is None:
        return {"item": "Lesson item not found in lesson."}

    swap_index = current_index - 1 if direction == "up" else current_index + 1
    if swap_index < 0 or swap_index >= len(items):
        return {"direction": "Lesson item cannot move further in that direction."}

    current_item = items[current_index]
    adjacent_item = items[swap_index]
    current_order = current_item.order_index
    adjacent_order = adjacent_item.order_index

    current_item.order_index = -1
    db.session.flush()
    adjacent_item.order_index = current_order
    db.session.flush()
    current_item.order_index = adjacent_order
    db.session.flush()
    return None


def concept_summary(concept):
    if concept is None:
        return None

    concept_texts = ConceptText.query.filter_by(concept_id=concept.id).all()
    completion = calculate_concept_completion(concept, get_active_required_languages(), concept_texts)

    return {
        "id": concept.id,
        "key": concept.key,
        "completionStatus": completion["completionStatus"],
    }


def list_items_for_lesson(lesson_id):
    from app.models.lesson_item import LessonItem

    return (
        LessonItem.query.filter_by(lesson_id=lesson_id)
        .order_by(LessonItem.order_index.asc(), LessonItem.created_at.asc())
        .all()
    )
