from flask import Blueprint, jsonify, request
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models.concept import Concept
from app.models.concept_text import ConceptText
from app.models.language import Language
from app.schemas.concept_text_schema import concept_text_to_dict
from app.utils.auth import require_admin

concept_text_bp = Blueprint("admin_concept_texts", __name__)

VALID_STATUSES = {"active", "disabled"}
VALID_STATUS_FILTERS = {"active", "disabled", "all"}
VALID_REVIEW_STATUSES = {"draft", "needs_review", "approved"}
VALID_REVIEW_STATUS_FILTERS = {"draft", "needs_review", "approved", "all"}
VALID_SORTS = {"updated", "concept", "language", "text"}
WRITABLE_FIELDS = {
    "text",
    "pronunciation",
    "literalMeaning",
    "usageNote",
    "status",
    "reviewStatus",
}


def _validation_error(fields):
    return jsonify({"error": {"message": "Validation failed.", "fields": fields}}), 400


def _optional_string(value):
    if value is None:
        return None

    normalized = str(value).strip()
    return normalized or None


def _validate_payload(data, existing_concept_text=None, partial=False):
    fields = {}
    normalized = {}

    if not partial or "conceptId" in data:
        concept_id = str(data.get("conceptId", "")).strip()
        if not concept_id:
            fields["conceptId"] = "Concept is required."
        else:
            concept = db.session.get(Concept, concept_id)
            if concept is None:
                return None, None, jsonify({"error": {"message": "Concept not found."}}), 404
            if existing_concept_text is None and concept.status == "disabled":
                return (
                    None,
                    None,
                    jsonify({"error": {"message": "Cannot create concept text for a disabled concept."}}),
                    400,
                )
            normalized["conceptId"] = concept_id

    if not partial or "languageId" in data:
        language_id = str(data.get("languageId", "")).strip()
        if not language_id:
            fields["languageId"] = "Language is required."
        else:
            language = db.session.get(Language, language_id)
            if language is None:
                return None, None, jsonify({"error": {"message": "Language not found."}}), 404
            if existing_concept_text is None and language.status == "disabled":
                return (
                    None,
                    None,
                    jsonify({"error": {"message": "Cannot create concept text for a disabled language."}}),
                    400,
                )
            normalized["languageId"] = language_id

    if not partial or "text" in data:
        text = str(data.get("text", "")).strip()
        if not text:
            fields["text"] = "Text is required."
        else:
            normalized["text"] = text

    for key in ("pronunciation", "literalMeaning", "usageNote"):
        if key in data:
            normalized[key] = _optional_string(data.get(key))

    if not partial or "status" in data:
        status = str(data.get("status", "active")).strip().lower()
        if status not in VALID_STATUSES:
            fields["status"] = "Status must be active or disabled."
        else:
            normalized["status"] = status

    if not partial or "reviewStatus" in data:
        review_status = str(data.get("reviewStatus", "draft")).strip().lower()
        if review_status not in VALID_REVIEW_STATUSES:
            fields["reviewStatus"] = "Review status must be draft, needs_review, or approved."
        else:
            normalized["reviewStatus"] = review_status

    concept_id = normalized.get("conceptId")
    language_id = normalized.get("languageId")
    if concept_id and language_id:
        duplicate = ConceptText.query.filter(
            ConceptText.concept_id == concept_id,
            ConceptText.language_id == language_id,
        )
        if existing_concept_text is not None:
            duplicate = duplicate.filter(ConceptText.id != existing_concept_text.id)
        if duplicate.first():
            fields["languageId"] = "This concept already has text for the selected language."

    if fields:
        return None, fields, None, None

    return normalized, None, None, None


def _apply_concept_text_payload(concept_text, payload):
    field_map = {
        "conceptId": "concept_id",
        "languageId": "language_id",
        "literalMeaning": "literal_meaning",
        "usageNote": "usage_note",
        "reviewStatus": "review_status",
    }

    for key, value in payload.items():
        setattr(concept_text, field_map.get(key, key), value)


@concept_text_bp.get("")
@require_admin
def list_concept_texts():
    search = (request.args.get("search") or "").strip()
    concept_id = (request.args.get("conceptId") or "").strip()
    language_id = (request.args.get("languageId") or "").strip()
    status = (request.args.get("status") or "all").strip().lower()
    review_status = (request.args.get("reviewStatus") or "all").strip().lower()
    sort = (request.args.get("sort") or "updated").strip()

    if status not in VALID_STATUS_FILTERS:
        return _validation_error({"status": "Status filter must be active, disabled, or all."})

    if review_status not in VALID_REVIEW_STATUS_FILTERS:
        return _validation_error(
            {"reviewStatus": "Review status filter must be draft, needs_review, approved, or all."}
        )

    if sort not in VALID_SORTS:
        return _validation_error({"sort": "Sort must be updated, concept, language, or text."})

    try:
        page = max(int(request.args.get("page", 1)), 1)
        page_size = min(max(int(request.args.get("pageSize", 20)), 1), 100)
    except ValueError:
        return _validation_error({"page": "Page and page size must be numbers."})

    query = ConceptText.query.join(Concept).join(Language)

    if concept_id:
        query = query.filter(ConceptText.concept_id == concept_id)

    if language_id:
        query = query.filter(ConceptText.language_id == language_id)

    if status != "all":
        query = query.filter(ConceptText.status == status)

    if review_status != "all":
        query = query.filter(ConceptText.review_status == review_status)

    if search:
        pattern = f"%{search.lower()}%"
        query = query.filter(
            or_(
                db.func.lower(ConceptText.text).like(pattern),
                db.func.lower(Concept.title).like(pattern),
                db.func.lower(Concept.key).like(pattern),
                db.func.lower(Language.name).like(pattern),
                db.func.lower(Language.code).like(pattern),
            )
        )

    total = query.count()
    order = (
        (Concept.title.asc(), Language.name.asc())
        if sort == "concept"
        else (Language.name.asc(), Concept.title.asc())
        if sort == "language"
        else (ConceptText.text.asc(),)
        if sort == "text"
        else (ConceptText.updated_at.desc(), Concept.title.asc(), Language.name.asc())
    )
    concept_texts = query.order_by(*order).offset((page - 1) * page_size).limit(page_size).all()

    return jsonify(
        {
            "data": [concept_text_to_dict(concept_text) for concept_text in concept_texts],
            "meta": {"page": page, "pageSize": page_size, "total": total},
        }
    )


@concept_text_bp.get("/<concept_text_id>")
@require_admin
def get_concept_text(concept_text_id):
    concept_text = db.session.get(ConceptText, concept_text_id)
    if concept_text is None:
        return jsonify({"error": {"message": "Concept text not found."}}), 404

    return jsonify({"data": concept_text_to_dict(concept_text)})


@concept_text_bp.post("")
@require_admin
def create_concept_text():
    data = request.get_json(silent=True) or {}
    payload, errors, response, status_code = _validate_payload(data)
    if response is not None:
        return response, status_code
    if errors:
        return _validation_error(errors)

    concept_text = ConceptText()
    _apply_concept_text_payload(concept_text, payload)

    db.session.add(concept_text)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return _validation_error(
            {"languageId": "This concept already has text for the selected language."}
        )

    return jsonify({"data": concept_text_to_dict(concept_text)}), 201


@concept_text_bp.patch("/<concept_text_id>")
@require_admin
def update_concept_text(concept_text_id):
    concept_text = db.session.get(ConceptText, concept_text_id)
    if concept_text is None:
        return jsonify({"error": {"message": "Concept text not found."}}), 404

    data = request.get_json(silent=True) or {}
    payload_data = {key: value for key, value in data.items() if key in WRITABLE_FIELDS}
    payload, errors, response, status_code = _validate_payload(
        payload_data,
        existing_concept_text=concept_text,
        partial=True,
    )
    if response is not None:
        return response, status_code
    if errors:
        return _validation_error(errors)

    _apply_concept_text_payload(concept_text, payload)
    db.session.commit()

    return jsonify({"data": concept_text_to_dict(concept_text)})


@concept_text_bp.patch("/<concept_text_id>/status")
@require_admin
def update_concept_text_status(concept_text_id):
    concept_text = db.session.get(ConceptText, concept_text_id)
    if concept_text is None:
        return jsonify({"error": {"message": "Concept text not found."}}), 404

    data = request.get_json(silent=True) or {}
    status = str(data.get("status", "")).strip().lower()

    if status not in VALID_STATUSES:
        return _validation_error({"status": "Status must be active or disabled."})

    concept_text.status = status
    db.session.commit()

    return jsonify({"data": concept_text_to_dict(concept_text, include_relationships=False)})
