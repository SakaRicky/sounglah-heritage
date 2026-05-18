def _format_timestamp(value):
    if value is None:
        return None

    timestamp = value.isoformat()
    if timestamp.endswith("+00:00"):
        return timestamp.replace("+00:00", "Z")

    return f"{timestamp}Z"


def concept_to_dict(concept):
    return {
        "id": concept.id,
        "key": concept.key,
        "slug": concept.slug,
        "title": concept.title,
        "description": concept.description,
        "category": concept.category,
        "difficultyLevel": concept.difficulty_level,
        "status": concept.status,
        "sortOrder": concept.sort_order,
        "createdAt": _format_timestamp(concept.created_at),
        "updatedAt": _format_timestamp(concept.updated_at),
    }
