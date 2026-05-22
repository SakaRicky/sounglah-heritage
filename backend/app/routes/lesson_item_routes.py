from flask import Blueprint, jsonify, request
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models.lesson import Lesson
from app.models.lesson_item import LessonItem
from app.schemas.lesson_item_schema import lesson_item_to_dict
from app.services.lesson_item_service import (
    WRITABLE_FIELDS,
    apply_item_payload,
    compact_order_indices,
    concept_summary,
    list_items_for_lesson,
    next_order_index,
    reorder_item,
    validate_item_payload,
)
from app.utils.auth import require_admin

lesson_items_nested_bp = Blueprint("admin_lesson_items_nested", __name__)
lesson_item_bp = Blueprint("admin_lesson_items", __name__)


def _validation_error(fields):
    return jsonify({"error": {"message": "Validation failed.", "fields": fields}}), 400


def _serialize_items(items):
    return [lesson_item_to_dict(item, concept_summary(item.concept)) for item in items]


def _get_lesson_or_404(lesson_id):
    lesson = db.session.get(Lesson, lesson_id)
    if lesson is None:
        return None, jsonify({"error": {"message": "Lesson not found."}}), 404
    return lesson, None, None


def _get_item_or_404(item_id):
    item = db.session.get(LessonItem, item_id)
    if item is None:
        return None, jsonify({"error": {"message": "Lesson item not found."}}), 404
    return item, None, None


@lesson_items_nested_bp.get("/<lesson_id>/items")
@require_admin
def list_lesson_items(lesson_id):
    lesson, error_response, status = _get_lesson_or_404(lesson_id)
    if error_response is not None:
        return error_response, status

    items = list_items_for_lesson(lesson.id)
    return jsonify({"data": _serialize_items(items)})


@lesson_items_nested_bp.post("/<lesson_id>/items")
@require_admin
def create_lesson_item(lesson_id):
    lesson, error_response, status = _get_lesson_or_404(lesson_id)
    if error_response is not None:
        return error_response, status

    data = request.get_json(silent=True) or {}
    payload, errors = validate_item_payload(data)
    if errors:
        return _validation_error(errors)

    if payload.get("orderIndex") is None:
        payload["orderIndex"] = next_order_index(lesson.id)

    item = LessonItem(lesson_id=lesson.id)
    apply_item_payload(item, payload)

    db.session.add(item)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return _validation_error({"orderIndex": "Order index must be unique within the lesson."})

    db.session.refresh(item)
    return jsonify({"data": lesson_item_to_dict(item, concept_summary(item.concept))}), 201


@lesson_item_bp.patch("/<item_id>")
@require_admin
def update_lesson_item(item_id):
    item, error_response, status = _get_item_or_404(item_id)
    if error_response is not None:
        return error_response, status

    data = request.get_json(silent=True) or {}
    payload_data = {key: value for key, value in data.items() if key in WRITABLE_FIELDS}
    payload, errors = validate_item_payload(payload_data, existing_item=item, partial=True)
    if errors:
        return _validation_error(errors)

    apply_item_payload(item, payload)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return _validation_error({"orderIndex": "Order index must be unique within the lesson."})

    db.session.refresh(item)
    return jsonify({"data": lesson_item_to_dict(item, concept_summary(item.concept))})


@lesson_item_bp.delete("/<item_id>")
@require_admin
def delete_lesson_item(item_id):
    item, error_response, status = _get_item_or_404(item_id)
    if error_response is not None:
        return error_response, status

    lesson_id = item.lesson_id
    db.session.delete(item)
    db.session.commit()
    compact_order_indices(lesson_id)
    db.session.commit()

    items = list_items_for_lesson(lesson_id)
    return jsonify({"data": _serialize_items(items)})


@lesson_item_bp.patch("/<item_id>/reorder")
@require_admin
def reorder_lesson_item(item_id):
    item, error_response, status = _get_item_or_404(item_id)
    if error_response is not None:
        return error_response, status

    data = request.get_json(silent=True) or {}
    direction = str(data.get("direction", "")).strip().lower()
    errors = reorder_item(item, direction)
    if errors:
        return _validation_error(errors)

    db.session.commit()
    items = list_items_for_lesson(item.lesson_id)
    return jsonify({"data": _serialize_items(items)})
