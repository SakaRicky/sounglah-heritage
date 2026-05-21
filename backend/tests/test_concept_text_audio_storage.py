from io import BytesIO
from unittest.mock import patch

import pytest
from werkzeug.datastructures import FileStorage

from app import create_app
from app.services import cloudinary_service
from app.services.concept_text_audio_storage import (
    AudioValidationError,
    upload_concept_text_audio,
)


def _audio_file(content=b"audio-bytes", filename="recording.webm", content_type="audio/webm"):
    return FileStorage(
        stream=BytesIO(content),
        filename=filename,
        content_type=content_type,
    )


def test_audio_storage_uploads_valid_audio_and_returns_metadata():
    app = create_app(testing=True)

    with app.app_context(), patch(
        "app.services.concept_text_audio_storage.cloudinary_service.upload_concept_text_audio"
    ) as upload_mock:
        upload_mock.return_value = {
            "secure_url": "https://res.cloudinary.com/demo/video/upload/recording.webm",
            "public_id": "sounglah/test/concept-text-audios/recording",
            "duration_seconds": 4,
        }

        metadata = upload_concept_text_audio(_audio_file(), duration_seconds="4.4")

    assert metadata == {
        "audio_url": "https://res.cloudinary.com/demo/video/upload/recording.webm",
        "audio_public_id": "sounglah/test/concept-text-audios/recording",
        "storage_provider": "cloudinary",
        "duration_seconds": 4,
        "file_size_bytes": len(b"audio-bytes"),
        "mime_type": "audio/webm",
    }
    upload_mock.assert_called_once()
    uploaded_file = upload_mock.call_args.args[0]
    assert uploaded_file.name == "recording.webm"
    assert uploaded_file.read() == b"audio-bytes"


def test_audio_storage_uses_cloudinary_audio_folder():
    app = create_app(testing=True)
    app.config.update(
        {
            "CLOUDINARY_CLOUD_NAME": "demo",
            "CLOUDINARY_API_KEY": "key",
            "CLOUDINARY_API_SECRET": "secret",
            "CLOUDINARY_UPLOAD_ROOT": "sounglah/test",
        }
    )

    with app.app_context(), patch("app.services.cloudinary_service.uploader.upload") as upload_mock:
        upload_mock.return_value = {
            "secure_url": "https://res.cloudinary.com/demo/video/upload/recording.webm",
            "public_id": "sounglah/test/concept-text-audios/recording",
            "duration": 3.5,
        }

        result = cloudinary_service.upload_concept_text_audio(BytesIO(b"audio-bytes"))

    assert result["duration_seconds"] == 3.5
    assert upload_mock.call_args.kwargs["folder"] == "sounglah/test/concept-text-audios"
    assert upload_mock.call_args.kwargs["resource_type"] == "video"


def test_audio_storage_rejects_missing_file():
    app = create_app(testing=True)

    with app.app_context(), pytest.raises(AudioValidationError) as error:
        upload_concept_text_audio(None)

    assert error.value.fields == {"audio": "Audio file is required."}


def test_audio_storage_rejects_invalid_file_type():
    app = create_app(testing=True)

    with app.app_context(), pytest.raises(AudioValidationError) as error:
        upload_concept_text_audio(_audio_file(filename="notes.txt", content_type="text/plain"))

    assert error.value.fields == {
        "audio": "Audio must be a WebM, MP3, WAV, M4A, AAC, or OGG file."
    }


def test_audio_storage_rejects_oversized_file():
    app = create_app(testing=True)
    app.config["MAX_AUDIO_UPLOAD_MB"] = 1
    oversized_content = b"a" * ((1 * 1024 * 1024) + 1)

    with app.app_context(), pytest.raises(AudioValidationError) as error:
        upload_concept_text_audio(_audio_file(content=oversized_content))

    assert error.value.fields == {"audio": "Audio must be 1 MB or smaller."}


def test_audio_storage_rejects_empty_file():
    app = create_app(testing=True)

    with app.app_context(), pytest.raises(AudioValidationError) as error:
        upload_concept_text_audio(_audio_file(content=b""))

    assert error.value.fields == {"audio": "Audio file cannot be empty."}


def test_audio_storage_rejects_audio_over_duration_limit():
    app = create_app(testing=True)
    app.config["MAX_AUDIO_DURATION_SECONDS"] = 30

    with app.app_context(), pytest.raises(AudioValidationError) as error:
        upload_concept_text_audio(_audio_file(), duration_seconds=31)

    assert error.value.fields == {"duration_seconds": "Audio must be 30 seconds or shorter."}
