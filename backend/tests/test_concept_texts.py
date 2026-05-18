from app import create_app
from app.extensions import db
from app.models.concept import Concept
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


def test_get_one_concept_text():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    list_response = client.get("/api/admin/concept-texts?search=bonjour", headers=headers)
    concept_text = list_response.get_json()["data"][0]
    response = client.get(f"/api/admin/concept-texts/{concept_text['id']}", headers=headers)

    assert response.status_code == 200
    assert response.get_json()["data"]["text"] == "Bonjour"


def test_create_concept_text_normalizes_values():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    concept_id, language_id = _lookup_ids(client, headers, "yes", "medumba")

    response = client.post(
        "/api/admin/concept-texts",
        headers=headers,
        json={
            "conceptId": concept_id,
            "languageId": language_id,
            "text": "  [needs translation]  ",
            "pronunciation": "  ",
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
        language = Language.query.filter_by(code="medumba").first()
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
            "usageNote": "Standard French greeting.",
            "reviewStatus": "approved",
        },
    )

    assert update_response.status_code == 200
    updated = update_response.get_json()["data"]
    assert updated["text"] == "Bonjour"
    assert updated["pronunciation"] == "bon-zhoor"
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
