def _format_timestamp(value):
    if value is None:
        return None

    timestamp = value.isoformat()
    if timestamp.endswith("+00:00"):
        return timestamp.replace("+00:00", "Z")

    return f"{timestamp}Z"


def lesson_to_dict(lesson, item_count=None):
    if item_count is None:
        item_count = sum(1 for item in lesson.items if item.is_active)

    return {
        "id": lesson.id,
        "title": lesson.title,
        "slug": lesson.slug,
        "description": lesson.description,
        "difficulty": lesson.difficulty,
        "estimatedMinutes": lesson.estimated_minutes,
        "coverImageUrl": lesson.cover_image_url,
        "coverImagePublicId": lesson.cover_image_public_id,
        "coverImageAltText": lesson.cover_image_alt_text,
        "status": lesson.status,
        "orderIndex": lesson.order_index,
        "itemCount": item_count,
        "createdAt": _format_timestamp(lesson.created_at),
        "updatedAt": _format_timestamp(lesson.updated_at),
    }
