import re

from flask import Blueprint, jsonify, request
from sqlalchemy import or_

from app.extensions import db
from app.models.concept import Concept
from app.schemas.concept_schema import concept_to_dict
from app.utils.auth import require_admin

concept_bp = Blueprint("admin_concepts", __name__)

VALID_DIFFICULTY_LEVELS = {"beginner", "intermediate", "advanced"}
VALID_STATUSES = {"active", "disabled"}
VALID_STATUS_FILTERS = {"active", "disabled", "all"}
VALID_DIFFICULTY_FILTERS = {"beginner", "intermediate", "advanced", "all"}
VALID_SORTS = {"title", "newest", "sortOrder"}
WRITABLE_FIELDS = {
    "key",
    "slug",
    "title",
    "description",
    "category",
    "difficultyLevel",
    "status",
    "sortOrder",
}


def _validation_error(fields):
    return jsonify({"error": {"message": "Validation failed.", "fields": fields}}), 400


def normalize_key(value):
    value = (value or "").strip().lower()
    value = re.sub(r"\s+", "_", value)
    value = re.sub(r"[^a-z0-9_]+", "", value)
    value = re.sub(r"_{2,}", "_", value)
    return value.strip("_")


def normalize_slug(value):
    value = (value or "").strip().lower()
    value = re.sub(r"\s+", "-", value)
    value = re.sub(r"[^a-z0-9-]+", "", value)
    value = re.sub(r"-{2,}", "-", value)
    return value.strip("-")


def _optional_string(value):
    if value is None:
        return None

    normalized = str(value).strip()
    return normalized or None


def _validate_payload(data, existing_concept=None, partial=False):
    fields = {}
    normalized = {}

    if not partial or "title" in data:
        title = str(data.get("title", "")).strip()
        if not title:
            fields["title"] = "Title is required."
        else:
            normalized["title"] = title

    if not partial or "key" in data:
        key = normalize_key(data.get("key"))
        if not key:
            fields["key"] = "Key is required."
        else:
            duplicate = Concept.query.filter(Concept.key == key)
            if existing_concept is not None:
                duplicate = duplicate.filter(Concept.id != existing_concept.id)
            if duplicate.first():
                fields["key"] = "Concept key already exists."
            normalized["key"] = key

    if not partial or "slug" in data:
        slug = normalize_slug(data.get("slug"))
        if not slug:
            fields["slug"] = "Slug is required."
        else:
            duplicate = Concept.query.filter(Concept.slug == slug)
            if existing_concept is not None:
                duplicate = duplicate.filter(Concept.id != existing_concept.id)
            if duplicate.first():
                fields["slug"] = "Concept slug already exists."
            normalized["slug"] = slug

    if "description" in data:
        normalized["description"] = _optional_string(data.get("description"))

    if "category" in data:
        normalized["category"] = _optional_string(data.get("category"))

    if not partial or "difficultyLevel" in data:
        difficulty_level = str(data.get("difficultyLevel", "beginner")).strip().lower()
        if difficulty_level not in VALID_DIFFICULTY_LEVELS:
            fields["difficultyLevel"] = "Difficulty level must be beginner, intermediate, or advanced."
        else:
            normalized["difficultyLevel"] = difficulty_level

    if not partial or "status" in data:
        status = str(data.get("status", "active")).strip().lower()
        if status not in VALID_STATUSES:
            fields["status"] = "Status must be active or disabled."
        else:
            normalized["status"] = status

    if not partial or "sortOrder" in data:
        try:
            normalized["sortOrder"] = int(data.get("sortOrder", 0))
        except (TypeError, ValueError):
            fields["sortOrder"] = "Sort order must be a number."

    if fields:
        return None, fields

    return normalized, None


def _apply_concept_payload(concept, payload):
    field_map = {
        "difficultyLevel": "difficulty_level",
        "sortOrder": "sort_order",
    }

    for key, value in payload.items():
        setattr(concept, field_map.get(key, key), value)


@concept_bp.get("")
@require_admin
def list_concepts():
    search = (request.args.get("search") or "").strip()
    status = (request.args.get("status") or "all").strip().lower()
    category = (request.args.get("category") or "").strip()
    difficulty_level = (request.args.get("difficultyLevel") or "all").strip().lower()
    sort = (request.args.get("sort") or "sortOrder").strip()

    if status not in VALID_STATUS_FILTERS:
        return _validation_error({"status": "Status filter must be active, disabled, or all."})

    if difficulty_level not in VALID_DIFFICULTY_FILTERS:
        return _validation_error(
            {"difficultyLevel": "Difficulty filter must be beginner, intermediate, advanced, or all."}
        )

    if sort not in VALID_SORTS:
        return _validation_error({"sort": "Sort must be title, newest, or sortOrder."})

    try:
        page = max(int(request.args.get("page", 1)), 1)
        page_size = min(max(int(request.args.get("pageSize", 20)), 1), 100)
    except ValueError:
        return _validation_error({"page": "Page and page size must be numbers."})

    query = Concept.query

    if status != "all":
        query = query.filter(Concept.status == status)

    if difficulty_level != "all":
        query = query.filter(Concept.difficulty_level == difficulty_level)

    if category:
        query = query.filter(db.func.lower(Concept.category) == category.lower())

    if search:
        pattern = f"%{search.lower()}%"
        query = query.filter(
            or_(
                db.func.lower(Concept.title).like(pattern),
                db.func.lower(Concept.key).like(pattern),
                db.func.lower(Concept.slug).like(pattern),
                db.func.lower(Concept.description).like(pattern),
                db.func.lower(Concept.category).like(pattern),
            )
        )

    total = query.count()
    order = (
        (Concept.updated_at.desc(), Concept.title.asc())
        if sort == "newest"
        else (Concept.title.asc(),)
        if sort == "title"
        else (Concept.sort_order.asc(), Concept.title.asc())
    )
    concepts = query.order_by(*order).offset((page - 1) * page_size).limit(page_size).all()

    return jsonify(
        {
            "data": [concept_to_dict(concept) for concept in concepts],
            "meta": {"page": page, "pageSize": page_size, "total": total},
        }
    )


@concept_bp.get("/<concept_id>")
@require_admin
def get_concept(concept_id):
    concept = db.session.get(Concept, concept_id)
    if concept is None:
        return jsonify({"error": {"message": "Concept not found."}}), 404

    return jsonify({"data": concept_to_dict(concept)})


@concept_bp.post("")
@require_admin
def create_concept():
    data = request.get_json(silent=True) or {}
    payload, errors = _validate_payload(data)
    if errors:
        return _validation_error(errors)

    concept = Concept()
    _apply_concept_payload(concept, payload)

    db.session.add(concept)
    db.session.commit()

    return jsonify({"data": concept_to_dict(concept)}), 201


@concept_bp.patch("/<concept_id>")
@require_admin
def update_concept(concept_id):
    concept = db.session.get(Concept, concept_id)
    if concept is None:
        return jsonify({"error": {"message": "Concept not found."}}), 404

    data = request.get_json(silent=True) or {}
    payload_data = {key: value for key, value in data.items() if key in WRITABLE_FIELDS}
    payload, errors = _validate_payload(payload_data, existing_concept=concept, partial=True)
    if errors:
        return _validation_error(errors)

    _apply_concept_payload(concept, payload)
    db.session.commit()

    return jsonify({"data": concept_to_dict(concept)})


@concept_bp.patch("/<concept_id>/status")
@require_admin
def update_concept_status(concept_id):
    concept = db.session.get(Concept, concept_id)
    if concept is None:
        return jsonify({"error": {"message": "Concept not found."}}), 404

    data = request.get_json(silent=True) or {}
    status = str(data.get("status", "")).strip().lower()

    if status not in VALID_STATUSES:
        return _validation_error({"status": "Status must be active or disabled."})

    concept.status = status
    db.session.commit()

    return jsonify({"data": concept_to_dict(concept)})
