from app import create_app
from app.extensions import db
from app.models.concept import Concept
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


def _lookup_ids(client, headers, concept_search="greeting", language_search="english"):
    concept_response = client.get(f"/api/admin/concepts?search={concept_search}", headers=headers)
    language_response = client.get(f"/api/admin/languages?search={language_search}", headers=headers)
    return (
        concept_response.get_json()["data"][0]["id"],
        language_response.get_json()["data"][0]["id"],
    )


def test_concept_texts_require_admin_authentication():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.get("/api/admin/concept-texts")

    assert response.status_code == 401
    assert response.get_json() == {
        "error": {"message": "Admin authentication is required."}
    }


def test_list_seeded_concept_texts():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.get("/api/admin/concept-texts", headers=auth_headers(client))

    assert response.status_code == 200
    data = response.get_json()
    assert data["meta"]["total"] == 12
    assert data["data"][0]["concept"]["key"]
    assert data["data"][0]["language"]["code"]
    assert "audioUrl" in data["data"][0]
    assert "currentAudioId" in data["data"][0]
    assert "pronunciationNote" in data["data"][0]


def test_get_one_concept_text():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    list_response = client.get("/api/admin/concept-texts?search=bonjour", headers=headers)
    concept_text = list_response.get_json()["data"][0]
    response = client.get(f"/api/admin/concept-texts/{concept_text['id']}", headers=headers)

    assert response.status_code == 200
    data = response.get_json()["data"]
    assert data["text"] == "Bonjour"
    assert "audioUrl" in data
    assert "currentAudioId" in data
    assert "pronunciationNote" in data


def test_create_concept_text_normalizes_values():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    concept_id, language_id = _lookup_ids(client, headers, "yes", "med")

    response = client.post(
        "/api/admin/concept-texts",
        headers=headers,
        json={
            "conceptId": concept_id,
            "languageId": language_id,
            "text": "  [needs translation]  ",
            "pronunciation": "  ",
            "audio_url": "  /media/audio/med/yes.mp3  ",
            "pronunciation_note": "  Native speaker review required. ",
            "literalMeaning": "  Placeholder pending translator review. ",
            "usageNote": "  Do not publish until reviewed. ",
            "status": "active",
            "reviewStatus": "needs_review",
        },
    )

    assert response.status_code == 201
    concept_text = response.get_json()["data"]
    assert concept_text["text"] == "[needs translation]"
    assert concept_text["pronunciation"] is None
    assert concept_text["audioUrl"] == "/media/audio/med/yes.mp3"
    assert concept_text["audio_url"] == "/media/audio/med/yes.mp3"
    assert concept_text["pronunciationNote"] == "Native speaker review required."
    assert concept_text["pronunciation_note"] == "Native speaker review required."
    assert concept_text["literalMeaning"] == "Placeholder pending translator review."
    assert concept_text["usageNote"] == "Do not publish until reviewed."
    assert concept_text["reviewStatus"] == "needs_review"


def test_create_concept_text_rejects_required_fields():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.post(
        "/api/admin/concept-texts",
        headers=auth_headers(client),
        json={"text": "   "},
    )

    assert response.status_code == 400
    fields = response.get_json()["error"]["fields"]
    assert fields["conceptId"] == "Concept is required."
    assert fields["languageId"] == "Language is required."
    assert fields["text"] == "Text is required."


def test_create_concept_text_rejects_missing_references_and_duplicates():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    concept_id, language_id = _lookup_ids(client, headers)

    missing_concept_response = client.post(
        "/api/admin/concept-texts",
        headers=headers,
        json={
            "conceptId": "missing-concept",
            "languageId": language_id,
            "text": "Hello",
            "status": "active",
            "reviewStatus": "draft",
        },
    )
    missing_language_response = client.post(
        "/api/admin/concept-texts",
        headers=headers,
        json={
            "conceptId": concept_id,
            "languageId": "missing-language",
            "text": "Hello",
            "status": "active",
            "reviewStatus": "draft",
        },
    )
    duplicate_response = client.post(
        "/api/admin/concept-texts",
        headers=headers,
        json={
            "conceptId": concept_id,
            "languageId": language_id,
            "text": "Hi",
            "status": "active",
            "reviewStatus": "draft",
        },
    )

    assert missing_concept_response.status_code == 404
    assert missing_concept_response.get_json()["error"]["message"] == "Concept not found."
    assert missing_language_response.status_code == 404
    assert missing_language_response.get_json()["error"]["message"] == "Language not found."
    assert duplicate_response.status_code == 400
    assert (
        duplicate_response.get_json()["error"]["fields"]["languageId"]
        == "This concept already has text for the selected language."
    )


def test_create_concept_text_rejects_disabled_concept_or_language():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    with app.app_context():
        concept = Concept.query.filter_by(key="yes").first()
        language = Language.query.filter_by(code="med").first()
        concept.status = "disabled"
        db.session.commit()
        concept_id = concept.id
        language_id = language.id

    disabled_concept_response = client.post(
        "/api/admin/concept-texts",
        headers=headers,
        json={
            "conceptId": concept_id,
            "languageId": language_id,
            "text": "[needs translation]",
        },
    )

    with app.app_context():
        concept = db.session.get(Concept, concept_id)
        language = db.session.get(Language, language_id)
        concept.status = "active"
        language.status = "disabled"
        db.session.commit()

    disabled_language_response = client.post(
        "/api/admin/concept-texts",
        headers=headers,
        json={
            "conceptId": concept_id,
            "languageId": language_id,
            "text": "[needs translation]",
        },
    )

    assert disabled_concept_response.status_code == 400
    assert (
        disabled_concept_response.get_json()["error"]["message"]
        == "Cannot create concept text for a disabled concept."
    )
    assert disabled_language_response.status_code == 400
    assert (
        disabled_language_response.get_json()["error"]["message"]
        == "Cannot create concept text for a disabled language."
    )


def test_update_concept_text_and_status_flow():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    list_response = client.get("/api/admin/concept-texts?search=bonjour", headers=headers)
    concept_text = list_response.get_json()["data"][0]

    update_response = client.patch(
        f"/api/admin/concept-texts/{concept_text['id']}",
        headers=headers,
        json={
            "text": "  Bonjour  ",
            "pronunciation": "bon-zhoor",
            "audioUrl": "/media/audio/fr/bonjour.mp3",
            "pronunciationNote": "Listen for the soft final r.",
            "usageNote": "Standard French greeting.",
            "reviewStatus": "approved",
        },
    )

    assert update_response.status_code == 200
    updated = update_response.get_json()["data"]
    assert updated["text"] == "Bonjour"
    assert updated["pronunciation"] == "bon-zhoor"
    assert updated["audioUrl"] == "/media/audio/fr/bonjour.mp3"
    assert updated["audio_url"] == "/media/audio/fr/bonjour.mp3"
    assert updated["pronunciationNote"] == "Listen for the soft final r."
    assert updated["pronunciation_note"] == "Listen for the soft final r."
    assert updated["usageNote"] == "Standard French greeting."
    assert updated["reviewStatus"] == "approved"

    disabled_response = client.patch(
        f"/api/admin/concept-texts/{concept_text['id']}/status",
        headers=headers,
        json={"status": "disabled"},
    )

    assert disabled_response.status_code == 200
    assert disabled_response.get_json()["data"]["status"] == "disabled"

    active_response = client.patch(
        f"/api/admin/concept-texts/{concept_text['id']}/status",
        headers=headers,
        json={"status": "active"},
    )

    assert active_response.status_code == 200
    assert active_response.get_json()["data"]["status"] == "active"


def test_filter_and_search_concept_texts():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    concept_id, language_id = _lookup_ids(client, headers, "greeting", "french")

    concept_response = client.get(f"/api/admin/concept-texts?conceptId={concept_id}", headers=headers)
    language_response = client.get(f"/api/admin/concept-texts?languageId={language_id}", headers=headers)
    review_response = client.get("/api/admin/concept-texts?reviewStatus=approved", headers=headers)
    search_response = client.get("/api/admin/concept-texts?search=bonjour", headers=headers)

    assert concept_response.status_code == 200
    assert {item["concept"]["key"] for item in concept_response.get_json()["data"]} == {"greeting"}
    assert language_response.status_code == 200
    assert {item["language"]["code"] for item in language_response.get_json()["data"]} == {"fr"}
    assert review_response.status_code == 200
    assert review_response.get_json()["meta"]["total"] == 12
    assert search_response.status_code == 200
    assert search_response.get_json()["data"][0]["text"] == "Bonjour"


def test_concept_text_audio_history_can_set_approved_current_audio():
    app = create_app(testing=True)

    with app.app_context():
        concept_text = ConceptText.query.join(Language).filter(Language.code == "fr").first()
        rejected_audio = ConceptTextAudio(
            concept_text_id=concept_text.id,
            audio_url="/media/audio/fr/bonjour-rejected.webm",
            audio_public_id="concept-text-audio/bonjour-rejected",
            storage_provider="cloudinary",
            duration_seconds=3,
            file_size_bytes=12000,
            mime_type="audio/webm",
            status=ConceptTextAudio.STATUS_REJECTED,
            review_note="Pronunciation needs to be clearer.",
        )
        approved_audio = ConceptTextAudio(
            concept_text_id=concept_text.id,
            audio_url="/media/audio/fr/bonjour-approved.webm",
            audio_public_id="concept-text-audio/bonjour-approved",
            storage_provider="cloudinary",
            duration_seconds=4,
            file_size_bytes=14000,
            mime_type="audio/webm",
            status=ConceptTextAudio.STATUS_APPROVED,
        )
        db.session.add_all([rejected_audio, approved_audio])
        db.session.flush()

        concept_text.set_current_audio(approved_audio)
        db.session.commit()

        saved = db.session.get(ConceptText, concept_text.id)
        assert saved.current_audio_id == approved_audio.id
        assert saved.current_audio.audio_url == "/media/audio/fr/bonjour-approved.webm"
        assert len(saved.audio_attempts) == 2


def test_concept_text_rejects_non_approved_current_audio():
    app = create_app(testing=True)

    with app.app_context():
        concept_text = ConceptText.query.first()
        pending_audio = ConceptTextAudio(
            concept_text_id=concept_text.id,
            audio_url="/media/audio/pending.webm",
            status=ConceptTextAudio.STATUS_PENDING_REVIEW,
        )
        db.session.add(pending_audio)
        db.session.flush()

        try:
            concept_text.set_current_audio(pending_audio)
        except ValueError as error:
            assert str(error) == "Only approved audio can become current audio."
        else:
            raise AssertionError("Pending audio should not become current audio.")


def test_concept_text_rejects_audio_from_another_concept_text_as_current():
    app = create_app(testing=True)

    with app.app_context():
        concept_texts = ConceptText.query.limit(2).all()
        audio = ConceptTextAudio(
            concept_text_id=concept_texts[1].id,
            audio_url="/media/audio/other.webm",
            status=ConceptTextAudio.STATUS_APPROVED,
        )
        db.session.add(audio)
        db.session.flush()

        try:
            concept_texts[0].set_current_audio(audio)
        except ValueError as error:
            assert str(error) == "Current audio must belong to this concept text."
        else:
            raise AssertionError("Audio from another concept text should not become current audio.")
