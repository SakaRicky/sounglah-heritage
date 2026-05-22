from cloudinary import config as cloudinary_config
from cloudinary import uploader
from flask import current_app


class CloudinaryConfigurationError(RuntimeError):
    pass


MEDIA_FOLDERS = {
    "concept_image": "concepts",
    "concept_text_audio": "concept-text-audios",
    "lesson_cover": "lesson-covers",
}


def _configure_cloudinary():
    cloud_name = current_app.config.get("CLOUDINARY_CLOUD_NAME")
    api_key = current_app.config.get("CLOUDINARY_API_KEY")
    api_secret = current_app.config.get("CLOUDINARY_API_SECRET")

    if not cloud_name or not api_key or not api_secret:
        raise CloudinaryConfigurationError("Cloudinary is not configured.")

    cloudinary_config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )


def _upload_root():
    return str(current_app.config.get("CLOUDINARY_UPLOAD_ROOT", "sounglah/dev")).strip().strip("/")


def folder_for(media_type):
    folder = MEDIA_FOLDERS[media_type]
    return f"{_upload_root()}/{folder}"


def upload_concept_image(file_obj):
    _configure_cloudinary()
    result = uploader.upload(
        file_obj,
        folder=folder_for("concept_image"),
        resource_type="image",
    )

    return {
        "secure_url": result["secure_url"],
        "public_id": result["public_id"],
    }


def upload_lesson_cover_image(file_obj):
    _configure_cloudinary()
    result = uploader.upload(
        file_obj,
        folder=folder_for("lesson_cover"),
        resource_type="image",
    )

    return {
        "secure_url": result["secure_url"],
        "public_id": result["public_id"],
    }


def upload_concept_text_audio(file_obj):
    _configure_cloudinary()
    result = uploader.upload(
        file_obj,
        folder=folder_for("concept_text_audio"),
        resource_type="video",
    )

    return {
        "secure_url": result["secure_url"],
        "public_id": result["public_id"],
        "duration_seconds": result.get("duration"),
    }


def delete_image(public_id):
    if not public_id:
        return

    _configure_cloudinary()
    uploader.destroy(public_id, resource_type="image")
