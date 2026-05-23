from pathlib import Path
from uuid import uuid4

from flask import current_app
from werkzeug.utils import secure_filename


LOCAL_PUBLIC_ID_PREFIX = "local/"

MEDIA_FOLDERS = {
    "concept_image": "concepts",
    "concept_text_audio": "concept-text-audios",
    "lesson_cover": "lesson-covers",
}


def _media_root():
    return Path(current_app.config["LOCAL_MEDIA_ROOT"]).resolve()


def _url_prefix():
    return str(current_app.config.get("LOCAL_MEDIA_URL_PREFIX", "/media")).rstrip("/")


def _extension_for(file_obj):
    filename = secure_filename(getattr(file_obj, "name", "") or "")
    suffix = Path(filename).suffix.lower()
    return suffix or ".bin"


def _write_media(file_obj, media_type):
    folder = MEDIA_FOLDERS[media_type]
    target_dir = _media_root() / folder
    target_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}{_extension_for(file_obj)}"
    relative_path = f"{folder}/{filename}"
    target_path = target_dir / filename

    if hasattr(file_obj, "seek"):
        file_obj.seek(0)

    target_path.write_bytes(file_obj.read())

    return {
        "secure_url": f"{_url_prefix()}/{relative_path}",
        "public_id": f"{LOCAL_PUBLIC_ID_PREFIX}{relative_path}",
        "storage_provider": "local",
    }


def upload_concept_image(file_obj):
    return _write_media(file_obj, "concept_image")


def upload_lesson_cover_image(file_obj):
    return _write_media(file_obj, "lesson_cover")


def upload_concept_text_audio(file_obj):
    return _write_media(file_obj, "concept_text_audio")


def delete_media(public_id):
    if not public_id or not public_id.startswith(LOCAL_PUBLIC_ID_PREFIX):
        return

    relative_path = public_id.removeprefix(LOCAL_PUBLIC_ID_PREFIX)
    target_path = (_media_root() / relative_path).resolve()
    media_root = _media_root()

    if media_root not in target_path.parents:
        return

    target_path.unlink(missing_ok=True)
