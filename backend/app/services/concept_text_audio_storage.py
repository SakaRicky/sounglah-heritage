from io import BytesIO

from flask import current_app

from app.services import cloudinary_service


ALLOWED_AUDIO_MIME_TYPES = {
    "audio/aac",
    "audio/mp4",
    "audio/mpeg",
    "audio/mp3",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
    "audio/x-m4a",
    "audio/x-wav",
}


class AudioValidationError(ValueError):
    def __init__(self, fields):
        super().__init__("Audio validation failed.")
        self.fields = fields


def _normalized_mime_type(file_storage):
    return (file_storage.mimetype or "").split(";")[0].strip().lower()


def _normalized_duration_seconds(value):
    if value in (None, ""):
        return None

    try:
        duration = round(float(value))
    except (TypeError, ValueError):
        raise AudioValidationError({"duration_seconds": "Duration must be a number."})

    if duration < 0:
        raise AudioValidationError({"duration_seconds": "Duration cannot be negative."})

    max_duration = current_app.config["MAX_AUDIO_DURATION_SECONDS"]
    if duration > max_duration:
        raise AudioValidationError(
            {"duration_seconds": f"Audio must be {max_duration} seconds or shorter."}
        )

    return duration


def _read_audio_content(file_storage):
    max_mb = current_app.config["MAX_AUDIO_UPLOAD_MB"]
    max_bytes = max_mb * 1024 * 1024
    content = file_storage.stream.read(max_bytes + 1)

    if len(content) > max_bytes:
        raise AudioValidationError({"audio": f"Audio must be {max_mb} MB or smaller."})

    if not content:
        raise AudioValidationError({"audio": "Audio file cannot be empty."})

    return content


def upload_concept_text_audio(file_storage, duration_seconds=None):
    if file_storage is None or not file_storage.filename:
        raise AudioValidationError({"audio": "Audio file is required."})

    mime_type = _normalized_mime_type(file_storage)
    if mime_type not in ALLOWED_AUDIO_MIME_TYPES:
        raise AudioValidationError(
            {"audio": "Audio must be a WebM, MP3, WAV, M4A, AAC, or OGG file."}
        )

    normalized_duration = _normalized_duration_seconds(duration_seconds)
    content = _read_audio_content(file_storage)
    upload_file = BytesIO(content)
    upload_file.name = file_storage.filename

    uploaded_audio = cloudinary_service.upload_concept_text_audio(upload_file)
    cloudinary_duration = uploaded_audio.get("duration_seconds")
    if normalized_duration is None and cloudinary_duration is not None:
        normalized_duration = _normalized_duration_seconds(cloudinary_duration)

    return {
        "audio_url": uploaded_audio["secure_url"],
        "audio_public_id": uploaded_audio["public_id"],
        "storage_provider": uploaded_audio.get("storage_provider", "cloudinary"),
        "duration_seconds": normalized_duration,
        "file_size_bytes": len(content),
        "mime_type": mime_type,
    }
