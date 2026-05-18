def _format_timestamp(value):
    if value is None:
        return None

    timestamp = value.isoformat()
    if timestamp.endswith("+00:00"):
        return timestamp.replace("+00:00", "Z")

    return f"{timestamp}Z"


def language_to_dict(language):
    return {
        "id": language.id,
        "name": language.name,
        "nativeName": language.native_name,
        "code": language.code,
        "slug": language.slug,
        "description": language.description,
        "direction": language.direction,
        "status": language.status,
        "sortOrder": language.sort_order,
        "createdAt": _format_timestamp(language.created_at),
        "updatedAt": _format_timestamp(language.updated_at),
    }
