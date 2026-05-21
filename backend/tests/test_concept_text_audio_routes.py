from datetime import datetime, timezone
from io import BytesIO
from unittest.mock import patch

from cloudinary.exceptions import Error as CloudinaryError

from app import create_app
from app.extensions import db
from app.models.concept_text import ConceptText
from app.models.concept_text_audio import ConceptTextAudio
from app.models.language import Language


def auth_headers(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@sounglah.com", "password": "password"},
    )
    token = response.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


def _concept_text_id(language_code="fr"):
    concept_text = ConceptText.query.join(Language).filter(Language.code == language_code).first()
    return concept_text.id


def _audio_upload_data(content=b"audio-bytes", filename="recording.webm"):
    return {
        "audio": (BytesIO(content), filename),
        "duration_seconds": "4",
    }


def _metadata():
    return {
        "audio_url": "https://res.cloudinary.com/demo/video/upload/recording.webm",
        "audio_public_id": "sounglah/test/concept-text-audios/recording",
        "storage_provider": "cloudinary",
        "duration_seconds": 4,
        "file_size_bytes": 11,
        "mime_type": "audio/webm",
    }


def test_concept_text_audio_upload_requires_admin_authentication():
    app = create_app(testing=True)
    client = app.test_client()
    with app.app_context():
        concept_text_id = _concept_text_id()

    response = client.post(
        f"/api/admin/concept-texts/{concept_text_id}/audios",
        data=_audio_upload_data(),
        content_type="multipart/form-data",
    )

    assert response.status_code == 401
    assert response.get_json() == {
        "error": {"message": "Admin authentication is required."}
    }


def test_concept_text_audio_upload_saves_pending_audio_metadata():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    with app.app_context():
        concept_text_id = _concept_text_id()

    with patch(
        "app.routes.concept_text_audio_routes.upload_concept_text_audio",
        return_value=_metadata(),
    ) as upload_mock:
        response = client.post(
            f"/api/admin/concept-texts/{concept_text_id}/audios",
            headers=headers,
            data=_audio_upload_data(),
            content_type="multipart/form-data",
        )

    assert response.status_code == 201
    data = response.get_json()["data"]
    assert data["conceptTextId"] == concept_text_id
    assert data["audioUrl"] == "https://res.cloudinary.com/demo/video/upload/recording.webm"
    assert data["durationSeconds"] == 4
    assert data["fileSizeBytes"] == 11
    assert data["mimeType"] == "audio/webm"
    assert data["status"] == "pending_review"
    assert data["recordedByUserId"] == 1
    assert data["submittedAt"] is not None
    upload_mock.assert_called_once()

    with app.app_context():
        saved_audio = db.session.get(ConceptTextAudio, data["id"])
        assert saved_audio is not None
        assert saved_audio.status == ConceptTextAudio.STATUS_PENDING_REVIEW


def test_concept_text_audio_upload_failure_does_not_create_audio_record():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    with app.app_context():
        concept_text_id = _concept_text_id()

    with patch(
        "app.routes.concept_text_audio_routes.upload_concept_text_audio",
        side_effect=CloudinaryError("upload failed"),
    ):
        response = client.post(
            f"/api/admin/concept-texts/{concept_text_id}/audios",
            headers=headers,
            data=_audio_upload_data(),
            content_type="multipart/form-data",
        )

    assert response.status_code == 503
    assert response.get_json()["error"]["message"] == "Unable to upload concept text audio to Cloudinary."
    with app.app_context():
        assert ConceptTextAudio.query.filter_by(concept_text_id=concept_text_id).count() == 0


def test_list_concept_text_audio_history():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    with app.app_context():
        concept_text_id = _concept_text_id()
        old_audio = ConceptTextAudio(
            concept_text_id=concept_text_id,
            audio_url="/media/audio/old.webm",
            status=ConceptTextAudio.STATUS_REJECTED,
        )
        new_audio = ConceptTextAudio(
            concept_text_id=concept_text_id,
            audio_url="/media/audio/new.webm",
            status=ConceptTextAudio.STATUS_PENDING_REVIEW,
        )
        db.session.add_all([old_audio, new_audio])
        db.session.commit()

    response = client.get(f"/api/admin/concept-texts/{concept_text_id}/audios", headers=headers)

    assert response.status_code == 200
    data = response.get_json()["data"]
    assert [audio["audioUrl"] for audio in data] == ["/media/audio/new.webm", "/media/audio/old.webm"]


def test_review_queue_defaults_to_pending_review_and_includes_context():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    with app.app_context():
        concept_text = ConceptText.query.join(Language).filter(Language.code == "fr").first()
        pending_audio = ConceptTextAudio(
            concept_text_id=concept_text.id,
            audio_url="/media/audio/pending.webm",
            status=ConceptTextAudio.STATUS_PENDING_REVIEW,
            submitted_at=datetime.now(timezone.utc),
        )
        approved_audio = ConceptTextAudio(
            concept_text_id=concept_text.id,
            audio_url="/media/audio/approved.webm",
            status=ConceptTextAudio.STATUS_APPROVED,
        )
        db.session.add_all([pending_audio, approved_audio])
        db.session.commit()

    response = client.get("/api/admin/concept-text-audios/review-queue", headers=headers)

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["meta"]["total"] == 1
    assert payload["data"][0]["audioUrl"] == "/media/audio/pending.webm"
    assert payload["data"][0]["conceptText"]["text"]
    assert payload["data"][0]["conceptText"]["language"]["code"] == "fr"


def test_approve_audio_sets_current_audio():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    with app.app_context():
        concept_text_id = _concept_text_id()
        audio = ConceptTextAudio(
            concept_text_id=concept_text_id,
            audio_url="/media/audio/pending.webm",
            status=ConceptTextAudio.STATUS_PENDING_REVIEW,
        )
        db.session.add(audio)
        db.session.commit()
        audio_id = audio.id

    response = client.patch(f"/api/admin/concept-text-audios/{audio_id}/approve", headers=headers)

    assert response.status_code == 200
    data = response.get_json()["data"]
    assert data["status"] == "approved"
    assert data["reviewedByUserId"] == 1
    assert data["approvedAt"] is not None
    with app.app_context():
        concept_text = db.session.get(ConceptText, concept_text_id)
        assert concept_text.current_audio_id == audio_id


def test_reject_audio_preserves_history_and_clears_current_audio():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    with app.app_context():
        concept_text = ConceptText.query.first()
        audio = ConceptTextAudio(
            concept_text_id=concept_text.id,
            audio_url="/media/audio/current.webm",
            status=ConceptTextAudio.STATUS_APPROVED,
        )
        db.session.add(audio)
        db.session.flush()
        concept_text.set_current_audio(audio)
        db.session.commit()
        audio_id = audio.id
        concept_text_id = concept_text.id

    response = client.patch(
        f"/api/admin/concept-text-audios/{audio_id}/reject",
        headers=headers,
        json={"review_note": "Please record this more clearly."},
    )

    assert response.status_code == 200
    data = response.get_json()["data"]
    assert data["status"] == "rejected"
    assert data["reviewNote"] == "Please record this more clearly."
    assert data["rejectedAt"] is not None
    with app.app_context():
        concept_text = db.session.get(ConceptText, concept_text_id)
        audio = db.session.get(ConceptTextAudio, audio_id)
        assert concept_text.current_audio_id is None
        assert audio.status == ConceptTextAudio.STATUS_REJECTED
