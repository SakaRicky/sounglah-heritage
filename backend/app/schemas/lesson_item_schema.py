def _format_timestamp(value):
    if value is None:
        return None

    timestamp = value.isoformat()
    if timestamp.endswith("+00:00"):
        return timestamp.replace("+00:00", "Z")

    return f"{timestamp}Z"


def lesson_item_to_dict(item, concept_summary=None):
    payload = {
        "id": item.id,
        "lessonId": item.lesson_id,
        "type": item.type,
        "conceptId": item.concept_id,
        "title": item.title,
        "instructionText": item.instruction_text,
        "contentJson": item.content_json or {},
        "orderIndex": item.order_index,
        "isActive": item.is_active,
        "createdAt": _format_timestamp(item.created_at),
        "updatedAt": _format_timestamp(item.updated_at),
    }

    if concept_summary is not None:
        payload["concept"] = concept_summary

    return payload
