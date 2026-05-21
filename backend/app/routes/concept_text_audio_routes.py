from datetime import datetime, timezone

from cloudinary.exceptions import Error as CloudinaryError
from flask import Blueprint, current_app, g, jsonify, request

from app.extensions import db
from app.models.concept_text import ConceptText
from app.models.concept_text_audio import ConceptTextAudio
from app.schemas.concept_text_audio_schema import concept_text_audio_to_dict
from app.services.concept_text_audio_storage import AudioValidationError, upload_concept_text_audio
from app.services.cloudinary_service import CloudinaryConfigurationError
from app.utils.auth import require_admin

concept_text_audio_nested_bp = Blueprint("admin_concept_text_audio_nested", __name__)
concept_text_audio_bp = Blueprint("admin_concept_text_audios", __name__)


def _validation_error(fields):
    return jsonify({"error": {"message": "Validation failed.", "fields": fields}}), 400


def _now():
    return datetime.now(timezone.utc)


def _optional_string(value):
    if value is None:
        return None

    normalized = str(value).strip()
    return normalized or None


@concept_text_audio_nested_bp.post("/<concept_text_id>/audios")
@require_admin
def upload_audio_for_concept_text(concept_text_id):
    concept_text = db.session.get(ConceptText, concept_text_id)
    if concept_text is None:
        return jsonify({"error": {"message": "Concept text not found."}}), 404

    try:
        metadata = upload_concept_text_audio(
            request.files.get("audio"),
            duration_seconds=request.form.get("duration_seconds"),
        )
    except AudioValidationError as error:
        return _validation_error(error.fields)
    except CloudinaryConfigurationError as error:
        return jsonify({"error": {"message": str(error)}}), 500
    except CloudinaryError:
        current_app.logger.exception("Cloudinary concept text audio upload failed.")
        return jsonify({"error": {"message": "Unable to upload concept text audio to Cloudinary."}}), 503

    audio = ConceptTextAudio(
        concept_text_id=concept_text.id,
        audio_url=metadata["audio_url"],
        audio_public_id=metadata["audio_public_id"],
        storage_provider=metadata["storage_provider"],
        duration_seconds=metadata["duration_seconds"],
        file_size_bytes=metadata["file_size_bytes"],
        mime_type=metadata["mime_type"],
        status=ConceptTextAudio.STATUS_PENDING_REVIEW,
        recorded_by_user_id=g.current_user.id,
        submitted_at=_now(),
    )
    db.session.add(audio)
    db.session.commit()

    return jsonify({"data": concept_text_audio_to_dict(audio)}), 201


@concept_text_audio_nested_bp.get("/<concept_text_id>/audios")
@require_admin
def list_audio_for_concept_text(concept_text_id):
    concept_text = db.session.get(ConceptText, concept_text_id)
    if concept_text is None:
        return jsonify({"error": {"message": "Concept text not found."}}), 404

    audios = (
        ConceptTextAudio.query.filter(ConceptTextAudio.concept_text_id == concept_text.id)
        .order_by(ConceptTextAudio.created_at.desc())
        .all()
    )

    return jsonify({"data": [concept_text_audio_to_dict(audio) for audio in audios]})


@concept_text_audio_bp.get("/review-queue")
@require_admin
def review_queue():
    status = (request.args.get("status") or ConceptTextAudio.STATUS_PENDING_REVIEW).strip().lower()
    concept_id = (request.args.get("concept_id") or request.args.get("conceptId") or "").strip()
    language_id = (request.args.get("language_id") or request.args.get("languageId") or "").strip()
    recorded_by_user_id = (
        request.args.get("recorded_by_user_id") or request.args.get("recordedByUserId") or ""
    ).strip()

    valid_statuses = {
        ConceptTextAudio.STATUS_DRAFT,
        ConceptTextAudio.STATUS_PENDING_REVIEW,
        ConceptTextAudio.STATUS_APPROVED,
        ConceptTextAudio.STATUS_REJECTED,
        ConceptTextAudio.STATUS_ARCHIVED,
        "all",
    }
    if status not in valid_statuses:
        return _validation_error({"status": "Status filter must be draft, pending_review, approved, rejected, archived, or all."})

    try:
        page = max(int(request.args.get("page", 1)), 1)
        page_size = min(max(int(request.args.get("pageSize", 20)), 1), 100)
    except ValueError:
        return _validation_error({"page": "Page and page size must be numbers."})

    query = ConceptTextAudio.query.join(
        ConceptText,
        ConceptTextAudio.concept_text_id == ConceptText.id,
    )

    if status != "all":
        query = query.filter(ConceptTextAudio.status == status)
    if concept_id:
        query = query.filter(ConceptText.concept_id == concept_id)
    if language_id:
        query = query.filter(ConceptText.language_id == language_id)
    if recorded_by_user_id:
        try:
            query = query.filter(ConceptTextAudio.recorded_by_user_id == int(recorded_by_user_id))
        except ValueError:
            return _validation_error({"recordedByUserId": "Recorded by user ID must be a number."})

    total = query.count()
    audios = (
        query.order_by(ConceptTextAudio.submitted_at.asc(), ConceptTextAudio.created_at.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return jsonify(
        {
            "data": [concept_text_audio_to_dict(audio, include_concept_text=True) for audio in audios],
            "meta": {"page": page, "pageSize": page_size, "total": total},
        }
    )


@concept_text_audio_bp.patch("/<audio_id>/approve")
@require_admin
def approve_audio(audio_id):
    audio = db.session.get(ConceptTextAudio, audio_id)
    if audio is None:
        return jsonify({"error": {"message": "Concept text audio not found."}}), 404

    audio.status = ConceptTextAudio.STATUS_APPROVED
    audio.reviewed_by_user_id = g.current_user.id
    audio.review_note = _optional_string((request.get_json(silent=True) or {}).get("review_note"))
    audio.approved_at = _now()
    audio.rejected_at = None
    audio.concept_text.set_current_audio(audio)
    db.session.commit()

    return jsonify({"data": concept_text_audio_to_dict(audio, include_concept_text=True)})


@concept_text_audio_bp.patch("/<audio_id>/reject")
@require_admin
def reject_audio(audio_id):
    audio = db.session.get(ConceptTextAudio, audio_id)
    if audio is None:
        return jsonify({"error": {"message": "Concept text audio not found."}}), 404

    data = request.get_json(silent=True) or {}
    audio.status = ConceptTextAudio.STATUS_REJECTED
    audio.reviewed_by_user_id = g.current_user.id
    audio.review_note = _optional_string(data.get("review_note"))
    audio.rejected_at = _now()
    audio.approved_at = None
    if audio.concept_text.current_audio_id == audio.id:
        audio.concept_text.current_audio_id = None
    db.session.commit()

    return jsonify({"data": concept_text_audio_to_dict(audio, include_concept_text=True)})
