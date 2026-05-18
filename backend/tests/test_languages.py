from app import create_app


def auth_headers(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@sounglah.com", "password": "password"},
    )
    token = response.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_languages_require_admin_authentication():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.get("/api/admin/languages")

    assert response.status_code == 401
    assert response.get_json() == {
        "error": {"message": "Admin authentication is required."}
    }


def test_list_seeded_languages():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.get("/api/admin/languages", headers=auth_headers(client))

    assert response.status_code == 200
    data = response.get_json()
    assert data["meta"]["total"] == 3
    assert [language["code"] for language in data["data"]] == ["medumba", "en", "fr"]


def test_create_language_normalizes_values():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.post(
        "/api/admin/languages",
        headers=auth_headers(client),
        json={
            "name": "  Fefe  ",
            "nativeName": "  Fèʼéfèʼe  ",
            "code": " FEFE ",
            "slug": "Fefe Language",
            "description": "  Western Grassfields language.  ",
            "direction": "ltr",
            "status": "active",
            "sortOrder": "4",
        },
    )

    assert response.status_code == 201
    language = response.get_json()["data"]
    assert language["name"] == "Fefe"
    assert language["nativeName"] == "Fèʼéfèʼe"
    assert language["code"] == "fefe"
    assert language["slug"] == "fefe-language"
    assert language["description"] == "Western Grassfields language."
    assert language["sortOrder"] == 4


def test_create_language_rejects_duplicate_code():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.post(
        "/api/admin/languages",
        headers=auth_headers(client),
        json={
            "name": "English duplicate",
            "code": "EN",
            "slug": "english-duplicate",
            "direction": "ltr",
            "status": "active",
            "sortOrder": 10,
        },
    )

    assert response.status_code == 400
    assert response.get_json()["error"]["fields"]["code"] == "Language code already exists."


def test_update_language_and_status_flow():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    list_response = client.get("/api/admin/languages?search=med", headers=headers)
    medumba = list_response.get_json()["data"][0]

    update_response = client.patch(
        f"/api/admin/languages/{medumba['id']}",
        headers=headers,
        json={
            "nativeName": "Mə̀dʉ̂mbɑ̀",
            "description": "Updated description.",
            "sortOrder": 7,
        },
    )

    assert update_response.status_code == 200
    updated = update_response.get_json()["data"]
    assert updated["nativeName"] == "Mə̀dʉ̂mbɑ̀"
    assert updated["description"] == "Updated description."
    assert updated["sortOrder"] == 7

    disabled_response = client.patch(
        f"/api/admin/languages/{medumba['id']}/status",
        headers=headers,
        json={"status": "disabled"},
    )

    assert disabled_response.status_code == 200
    assert disabled_response.get_json()["data"]["status"] == "disabled"

    active_response = client.patch(
        f"/api/admin/languages/{medumba['id']}/status",
        headers=headers,
        json={"status": "active"},
    )

    assert active_response.status_code == 200
    assert active_response.get_json()["data"]["status"] == "active"


def test_filter_disabled_languages():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    list_response = client.get("/api/admin/languages?search=french", headers=headers)
    french = list_response.get_json()["data"][0]
    client.patch(
        f"/api/admin/languages/{french['id']}/status",
        headers=headers,
        json={"status": "disabled"},
    )

    disabled_response = client.get("/api/admin/languages?status=disabled", headers=headers)

    assert disabled_response.status_code == 200
    data = disabled_response.get_json()
    assert data["meta"]["total"] == 1
    assert data["data"][0]["code"] == "fr"
