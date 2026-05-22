import re

from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from app.extensions import db
from app.models.language import Language
from app.schemas.language_schema import language_to_dict
from app.utils.auth import require_admin

language_bp = Blueprint("admin_languages", __name__)

VALID_DIRECTIONS = {"ltr", "rtl"}
VALID_STATUSES = {"active", "disabled"}
VALID_STATUS_FILTERS = {"active", "disabled", "all"}
WRITABLE_FIELDS = {
    "name",
    "nativeName",
    "code",
    "slug",
    "description",
    "direction",
    "status",
    "isRequiredForConceptCompletion",
    "sortOrder",
}


def _validation_error(fields):
    return jsonify({"error": {"message": "Validation failed.", "fields": fields}}), 400


def normalize_slug(value):
    value = (value or "").strip().lower()
    value = re.sub(r"\s+", "-", value)
    value = re.sub(r"[^a-z0-9-]+", "", value)
    value = re.sub(r"-{2,}", "-", value)
    return value.strip("-")


def normalize_code(value):
    return (value or "").strip().lower()


def _optional_string(value):
    if value is None:
        return None

    normalized = str(value).strip()
    return normalized or None


def _normalize_bool(value):
    if isinstance(value, bool):
        return value

    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"true", "1", "yes"}:
            return True
        if normalized in {"false", "0", "no"}:
            return False

    raise ValueError


def _validate_payload(data, existing_language=None, partial=False):
    fields = {}
    normalized = {}

    if not partial or "name" in data:
        name = str(data.get("name", "")).strip()
        if not name:
            fields["name"] = "Name is required."
        else:
            normalized["name"] = name

    if "nativeName" in data:
        normalized["nativeName"] = _optional_string(data.get("nativeName"))

    if not partial or "code" in data:
        code = normalize_code(data.get("code"))
        if not code:
            fields["code"] = "Code is required."
        else:
            duplicate = Language.query.filter(Language.code == code)
            if existing_language is not None:
                duplicate = duplicate.filter(Language.id != existing_language.id)
            if duplicate.first():
                fields["code"] = "Language code already exists."
            normalized["code"] = code

    if not partial or "slug" in data:
        slug = normalize_slug(data.get("slug"))
        if not slug:
            fields["slug"] = "Slug is required."
        else:
            duplicate = Language.query.filter(Language.slug == slug)
            if existing_language is not None:
                duplicate = duplicate.filter(Language.id != existing_language.id)
            if duplicate.first():
                fields["slug"] = "Language slug already exists."
            normalized["slug"] = slug

    if "description" in data:
        normalized["description"] = _optional_string(data.get("description"))

    if not partial or "direction" in data:
        direction = str(data.get("direction", "ltr")).strip().lower()
        if direction not in VALID_DIRECTIONS:
            fields["direction"] = "Direction must be ltr or rtl."
        else:
            normalized["direction"] = direction

    if not partial or "status" in data:
        status = str(data.get("status", "active")).strip().lower()
        if status not in VALID_STATUSES:
            fields["status"] = "Status must be active or disabled."
        else:
            normalized["status"] = status

    if not partial or "isRequiredForConceptCompletion" in data:
        try:
            normalized["isRequiredForConceptCompletion"] = _normalize_bool(
                data.get("isRequiredForConceptCompletion", False)
            )
        except ValueError:
            fields["isRequiredForConceptCompletion"] = "Required-for-completion must be true or false."

    if not partial or "sortOrder" in data:
        try:
            normalized["sortOrder"] = int(data.get("sortOrder", 0))
        except (TypeError, ValueError):
            fields["sortOrder"] = "Sort order must be a number."

    if fields:
        return None, fields

    return normalized, None


def _apply_language_payload(language, payload):
    field_map = {
        "nativeName": "native_name",
        "isRequiredForConceptCompletion": "is_required_for_concept_completion",
        "sortOrder": "sort_order",
    }

    for key, value in payload.items():
        setattr(language, field_map.get(key, key), value)


@language_bp.get("")
@require_admin
def list_languages():
    search = (request.args.get("search") or "").strip()
    status = (request.args.get("status") or "all").strip().lower()

    if status not in VALID_STATUS_FILTERS:
        return _validation_error({"status": "Status filter must be active, disabled, or all."})

    try:
        page = max(int(request.args.get("page", 1)), 1)
        page_size = min(max(int(request.args.get("pageSize", 20)), 1), 100)
    except ValueError:
        return _validation_error({"page": "Page and page size must be numbers."})

    query = Language.query

    if status != "all":
        query = query.filter(Language.status == status)

    if search:
        pattern = f"%{search.lower()}%"
        query = query.filter(
            or_(
                db.func.lower(Language.name).like(pattern),
                db.func.lower(Language.native_name).like(pattern),
                db.func.lower(Language.code).like(pattern),
                db.func.lower(Language.slug).like(pattern),
            )
        )

    total = query.count()
    languages = (
        query.order_by(Language.sort_order.asc(), Language.name.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return jsonify(
        {
            "data": [language_to_dict(language) for language in languages],
            "meta": {"page": page, "pageSize": page_size, "total": total},
        }
    )


@language_bp.post("")
@require_admin
def create_language():
    data = request.get_json(silent=True) or {}
    payload, errors = _validate_payload(data)
    if errors:
        return _validation_error(errors)

    language = Language()
    _apply_language_payload(language, payload)

    db.session.add(language)
    db.session.commit()

    return jsonify({"data": language_to_dict(language)}), 201


@language_bp.patch("/<language_id>")
@require_admin
def update_language(language_id):
    language = db.session.get(Language, language_id)
    if language is None:
        return jsonify({"error": {"message": "Language not found."}}), 404

    data = request.get_json(silent=True) or {}
    payload_data = {key: value for key, value in data.items() if key in WRITABLE_FIELDS}
    payload, errors = _validate_payload(payload_data, existing_language=language, partial=True)
    if errors:
        return _validation_error(errors)

    _apply_language_payload(language, payload)
    db.session.commit()

    return jsonify({"data": language_to_dict(language)})


@language_bp.patch("/<language_id>/status")
@require_admin
def update_language_status(language_id):
    language = db.session.get(Language, language_id)
    if language is None:
        return jsonify({"error": {"message": "Language not found."}}), 404

    data = request.get_json(silent=True) or {}
    status = str(data.get("status", "")).strip().lower()

    if status not in VALID_STATUSES:
        return _validation_error({"status": "Status must be active or disabled."})

    language.status = status
    db.session.commit()

    return jsonify({"data": language_to_dict(language)})
