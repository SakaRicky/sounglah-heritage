import re
from io import BytesIO

from cloudinary.exceptions import Error as CloudinaryError
from flask import Blueprint, current_app, jsonify, request
from sqlalchemy import func, or_

from app.extensions import db
from app.models.lesson import Lesson
from app.models.lesson_item import LessonItem
from app.schemas.lesson_schema import lesson_to_dict
from app.services import cloudinary_service
from app.services.cloudinary_service import CloudinaryConfigurationError
from app.services.lesson_publish_service import prepare_lesson_for_publish, validate_lesson_publish
from app.utils.auth import require_admin

lesson_bp = Blueprint("admin_lessons", __name__)

VALID_DIFFICULTIES = {"beginner", "intermediate", "advanced"}
VALID_STATUSES = {"draft", "published", "archived"}
VALID_STATUS_FILTERS = {"draft", "published", "archived", "all"}
VALID_DIFFICULTY_FILTERS = {"beginner", "intermediate", "advanced", "all"}
VALID_SORTS = {"orderIndex", "title", "updatedAt"}
ALLOWED_IMAGE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
WRITABLE_FIELDS = {
    "title",
    "slug",
    "description",
    "difficulty",
    "estimatedMinutes",
    "coverImageUrl",
    "coverImagePublicId",
    "coverImageAltText",
    "status",
    "orderIndex",
}


def _validation_error(fields):
    return jsonify({"error": {"message": "Validation failed.", "fields": fields}}), 400


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


def _optional_string_with_max(value, max_length):
    normalized = _optional_string(value)
    if normalized is not None and len(normalized) > max_length:
        return normalized, f"Must be {max_length} characters or fewer."

    return normalized, None


def _pagination_args():
    try:
        page = max(int(request.args.get("page", 1)), 1)
        page_size = min(max(int(request.args.get("pageSize", 20)), 1), 100)
    except ValueError:
        return None, None, {"page": "Page and page size must be numbers."}

    return page, page_size, None


def _validate_payload(data, existing_lesson=None, partial=False):
    fields = {}
    normalized = {}

    if not partial or "title" in data:
        title = str(data.get("title", "")).strip()
        if not title:
            fields["title"] = "Title is required."
        else:
            normalized["title"] = title

    if not partial or "slug" in data:
        slug = normalize_slug(data.get("slug"))
        if not slug:
            fields["slug"] = "Slug is required."
        else:
            duplicate = Lesson.query.filter(Lesson.slug == slug)
            if existing_lesson is not None:
                duplicate = duplicate.filter(Lesson.id != existing_lesson.id)
            if duplicate.first():
                fields["slug"] = "Lesson slug already exists."
            normalized["slug"] = slug

    if "description" in data:
        normalized["description"] = _optional_string(data.get("description"))

    if not partial or "difficulty" in data:
        difficulty = str(data.get("difficulty", "beginner")).strip().lower()
        if difficulty not in VALID_DIFFICULTIES:
            fields["difficulty"] = "Difficulty must be beginner, intermediate, or advanced."
        else:
            normalized["difficulty"] = difficulty

    if "estimatedMinutes" in data:
        estimated_minutes = data.get("estimatedMinutes")
        if estimated_minutes is None:
            normalized["estimatedMinutes"] = None
        else:
            try:
                estimated_minutes = int(estimated_minutes)
            except (TypeError, ValueError):
                fields["estimatedMinutes"] = "Estimated minutes must be a positive integer."
            else:
                if estimated_minutes <= 0:
                    fields["estimatedMinutes"] = "Estimated minutes must be a positive integer."
                else:
                    normalized["estimatedMinutes"] = estimated_minutes

    cover_image_url_value = data.get("coverImageUrl", data.get("cover_image_url"))
    if "coverImageUrl" in data or "cover_image_url" in data:
        cover_image_url, error = _optional_string_with_max(cover_image_url_value, 500)
        if error:
            fields["coverImageUrl"] = error
        else:
            normalized["coverImageUrl"] = cover_image_url

    cover_image_public_id_value = data.get("coverImagePublicId", data.get("cover_image_public_id"))
    if "coverImagePublicId" in data or "cover_image_public_id" in data:
        cover_image_public_id, error = _optional_string_with_max(cover_image_public_id_value, 255)
        if error:
            fields["coverImagePublicId"] = error
        else:
            normalized["coverImagePublicId"] = cover_image_public_id

    cover_image_alt_text_value = data.get("coverImageAltText", data.get("cover_image_alt_text"))
    if "coverImageAltText" in data or "cover_image_alt_text" in data:
        cover_image_alt_text, error = _optional_string_with_max(cover_image_alt_text_value, 255)
        if error:
            fields["coverImageAltText"] = error
        else:
            normalized["coverImageAltText"] = cover_image_alt_text

    if not partial or "status" in data:
        status = str(data.get("status", "draft")).strip().lower()
        if status not in VALID_STATUSES:
            fields["status"] = "Status must be draft, published, or archived."
        else:
            normalized["status"] = status

    if not partial or "orderIndex" in data:
        try:
            normalized["orderIndex"] = int(data.get("orderIndex", 0))
        except (TypeError, ValueError):
            fields["orderIndex"] = "Order index must be a number."

    if fields:
        return None, fields

    return normalized, None


def _apply_lesson_payload(lesson, payload):
    field_map = {
        "estimatedMinutes": "estimated_minutes",
        "coverImageUrl": "cover_image_url",
        "coverImagePublicId": "cover_image_public_id",
        "coverImageAltText": "cover_image_alt_text",
        "orderIndex": "order_index",
    }

    for key, value in payload.items():
        setattr(lesson, field_map.get(key, key), value)


def _active_item_counts(lesson_ids):
    if not lesson_ids:
        return {}

    rows = (
        db.session.query(LessonItem.lesson_id, func.count(LessonItem.id))
        .filter(LessonItem.lesson_id.in_(lesson_ids), LessonItem.is_active.is_(True))
        .group_by(LessonItem.lesson_id)
        .all()
    )
    return {lesson_id: count for lesson_id, count in rows}


def _publish_validation_error(publish_fields):
    return (
        jsonify(
            {
                "error": {
                    "message": "Lesson cannot be published until curriculum requirements are met.",
                    "fields": publish_fields,
                }
            }
        ),
        400,
    )


def _image_file_from_request():
    image_file = request.files.get("image")
    if image_file is None or not image_file.filename:
        return None, {"image": "Image file is required."}

    if image_file.mimetype not in ALLOWED_IMAGE_MIME_TYPES:
        return None, {"image": "Image must be a JPEG, PNG, or WebP file."}

    max_bytes = current_app.config["MAX_IMAGE_UPLOAD_MB"] * 1024 * 1024
    content = image_file.stream.read(max_bytes + 1)
    if len(content) > max_bytes:
        return None, {"image": f"Image must be {current_app.config['MAX_IMAGE_UPLOAD_MB']} MB or smaller."}

    if not content:
        return None, {"image": "Image file cannot be empty."}

    return BytesIO(content), None


@lesson_bp.get("")
@require_admin
def list_lessons():
    search = (request.args.get("search") or "").strip()
    status = (request.args.get("status") or "all").strip().lower()
    difficulty = (request.args.get("difficulty") or "all").strip().lower()
    sort = (request.args.get("sort") or "orderIndex").strip()

    if status not in VALID_STATUS_FILTERS:
        return _validation_error({"status": "Status filter must be draft, published, archived, or all."})

    if difficulty not in VALID_DIFFICULTY_FILTERS:
        return _validation_error(
            {"difficulty": "Difficulty filter must be beginner, intermediate, advanced, or all."}
        )

    if sort not in VALID_SORTS:
        return _validation_error({"sort": "Sort must be orderIndex, title, or updatedAt."})

    page, page_size, pagination_errors = _pagination_args()
    if pagination_errors:
        return _validation_error(pagination_errors)

    query = Lesson.query

    if status != "all":
        query = query.filter(Lesson.status == status)

    if difficulty != "all":
        query = query.filter(Lesson.difficulty == difficulty)

    if search:
        pattern = f"%{search.lower()}%"
        query = query.filter(
            or_(
                db.func.lower(Lesson.title).like(pattern),
                db.func.lower(Lesson.slug).like(pattern),
            )
        )

    total = query.count()
    order = (
        (Lesson.updated_at.desc(), Lesson.title.asc())
        if sort == "updatedAt"
        else (Lesson.title.asc(),)
        if sort == "title"
        else (Lesson.order_index.asc(), Lesson.title.asc())
    )
    lessons = query.order_by(*order).offset((page - 1) * page_size).limit(page_size).all()
    item_counts = _active_item_counts([lesson.id for lesson in lessons])

    return jsonify(
        {
            "data": [
                lesson_to_dict(lesson, item_count=item_counts.get(lesson.id, 0)) for lesson in lessons
            ],
            "meta": {"page": page, "pageSize": page_size, "total": total},
        }
    )


@lesson_bp.get("/<lesson_id>")
@require_admin
def get_lesson(lesson_id):
    lesson = db.session.get(Lesson, lesson_id)
    if lesson is None:
        return jsonify({"error": {"message": "Lesson not found."}}), 404

    item_count = _active_item_counts([lesson.id]).get(lesson.id, 0)
    return jsonify({"data": lesson_to_dict(lesson, item_count=item_count)})


@lesson_bp.post("")
@require_admin
def create_lesson():
    data = request.get_json(silent=True) or {}
    payload, errors = _validate_payload(data)
    if errors:
        return _validation_error(errors)

    if payload.get("status") == "published":
        publish_fields = validate_lesson_publish(Lesson())
        if publish_fields:
            return _publish_validation_error(publish_fields)

    lesson = Lesson()
    _apply_lesson_payload(lesson, payload)

    db.session.add(lesson)
    db.session.commit()

    return jsonify({"data": lesson_to_dict(lesson, item_count=0)}), 201


@lesson_bp.patch("/<lesson_id>")
@require_admin
def update_lesson(lesson_id):
    lesson = db.session.get(Lesson, lesson_id)
    if lesson is None:
        return jsonify({"error": {"message": "Lesson not found."}}), 404

    data = request.get_json(silent=True) or {}
    payload_data = {key: value for key, value in data.items() if key in WRITABLE_FIELDS}
    payload, errors = _validate_payload(payload_data, existing_lesson=lesson, partial=True)
    if errors:
        return _validation_error(errors)

    next_status = payload.get("status", lesson.status)
    if next_status == "published":
        publish_fields = prepare_lesson_for_publish(lesson)
        if publish_fields:
            return _publish_validation_error(publish_fields)

    _apply_lesson_payload(lesson, payload)
    db.session.commit()

    item_count = _active_item_counts([lesson.id]).get(lesson.id, 0)
    return jsonify({"data": lesson_to_dict(lesson, item_count=item_count)})


@lesson_bp.delete("/<lesson_id>")
@require_admin
def delete_lesson(lesson_id):
    lesson = db.session.get(Lesson, lesson_id)
    if lesson is None:
        return jsonify({"error": {"message": "Lesson not found."}}), 404

    db.session.delete(lesson)
    db.session.commit()

    return "", 204


@lesson_bp.post("/<lesson_id>/cover-image")
@require_admin
def upload_lesson_cover_image(lesson_id):
    lesson = db.session.get(Lesson, lesson_id)
    if lesson is None:
        return jsonify({"error": {"message": "Lesson not found."}}), 404

    image_file, errors = _image_file_from_request()
    if errors:
        return _validation_error(errors)

    alt_text = _optional_string(request.form.get("cover_image_alt_text"))
    old_public_id = lesson.cover_image_public_id

    try:
        uploaded_image = cloudinary_service.upload_lesson_cover_image(image_file)
        if old_public_id:
            cloudinary_service.delete_image(old_public_id)
    except CloudinaryConfigurationError as error:
        return jsonify({"error": {"message": str(error)}}), 500
    except CloudinaryError:
        current_app.logger.exception("Cloudinary lesson cover upload failed.")
        return jsonify({"error": {"message": "Unable to upload lesson cover image to Cloudinary."}}), 503

    lesson.cover_image_url = uploaded_image["secure_url"]
    lesson.cover_image_public_id = uploaded_image["public_id"]
    lesson.cover_image_alt_text = alt_text if alt_text is not None else lesson.cover_image_alt_text
    db.session.commit()

    item_count = _active_item_counts([lesson.id]).get(lesson.id, 0)
    return jsonify({"data": lesson_to_dict(lesson, item_count=item_count)})


@lesson_bp.patch("/<lesson_id>/cover-image-alt-text")
@require_admin
def update_lesson_cover_image_alt_text(lesson_id):
    lesson = db.session.get(Lesson, lesson_id)
    if lesson is None:
        return jsonify({"error": {"message": "Lesson not found."}}), 404

    data = request.get_json(silent=True) or {}
    cover_image_alt_text_value = data.get("coverImageAltText", data.get("cover_image_alt_text"))
    cover_image_alt_text, error = _optional_string_with_max(cover_image_alt_text_value, 255)
    if error:
        return _validation_error({"coverImageAltText": error})

    lesson.cover_image_alt_text = cover_image_alt_text
    db.session.commit()

    item_count = _active_item_counts([lesson.id]).get(lesson.id, 0)
    return jsonify({"data": lesson_to_dict(lesson, item_count=item_count)})


@lesson_bp.delete("/<lesson_id>/cover-image")
@require_admin
def delete_lesson_cover_image(lesson_id):
    lesson = db.session.get(Lesson, lesson_id)
    if lesson is None:
        return jsonify({"error": {"message": "Lesson not found."}}), 404

    if lesson.cover_image_public_id:
        try:
            cloudinary_service.delete_image(lesson.cover_image_public_id)
        except CloudinaryConfigurationError as error:
            return jsonify({"error": {"message": str(error)}}), 500
        except CloudinaryError:
            current_app.logger.exception("Cloudinary lesson cover deletion failed.")
            return jsonify({"error": {"message": "Unable to remove lesson cover image from Cloudinary."}}), 503

    lesson.cover_image_url = None
    lesson.cover_image_public_id = None
    lesson.cover_image_alt_text = None
    db.session.commit()

    item_count = _active_item_counts([lesson.id]).get(lesson.id, 0)
    return jsonify({"data": lesson_to_dict(lesson, item_count=item_count)})
