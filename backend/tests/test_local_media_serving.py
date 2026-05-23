from pathlib import Path

from app import create_app
from app.config import _BACKEND_ROOT, _resolve_local_media_root


def test_resolve_local_media_root_from_backend_relative_path():
    resolved = Path(_resolve_local_media_root("../media"))
    expected = (_BACKEND_ROOT.parent / "media").resolve()

    assert resolved == expected


def test_local_media_route_serves_file_with_relative_media_root(tmp_path):
    media_root = tmp_path / "media-store"
    concepts_dir = media_root / "concepts"
    concepts_dir.mkdir(parents=True)
    image_name = "sample.jpg"
    (concepts_dir / image_name).write_bytes(b"fake-jpeg")

    app = create_app(testing=True)
    app.config.update(
        {
            "MEDIA_STORAGE_PROVIDER": "local",
            "LOCAL_MEDIA_ROOT": str(media_root),
            "LOCAL_MEDIA_URL_PREFIX": "/media",
        }
    )

    client = app.test_client()
    response = client.get(f"/media/concepts/{image_name}")

    assert response.status_code == 200
    assert response.data == b"fake-jpeg"


def test_local_media_route_serves_concept_text_audio_as_audio_webm(tmp_path):
    media_root = tmp_path / "media-store"
    audio_dir = media_root / "concept-text-audios"
    audio_dir.mkdir(parents=True)
    audio_name = "sample.webm"
    (audio_dir / audio_name).write_bytes(b"fake-webm")

    app = create_app(testing=True)
    app.config.update(
        {
            "MEDIA_STORAGE_PROVIDER": "local",
            "LOCAL_MEDIA_ROOT": str(media_root),
            "LOCAL_MEDIA_URL_PREFIX": "/media",
        }
    )

    client = app.test_client()
    response = client.get(f"/media/concept-text-audios/{audio_name}")

    assert response.status_code == 200
    assert response.data == b"fake-webm"
    assert response.mimetype == "audio/webm"
