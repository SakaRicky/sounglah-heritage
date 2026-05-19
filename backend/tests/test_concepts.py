from app import create_app


def auth_headers(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "admin@sounglah.com", "password": "password"},
    )
    token = response.get_json()["token"]
    return {"Authorization": f"Bearer {token}"}


def test_concepts_require_admin_authentication():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.get("/api/admin/concepts")

    assert response.status_code == 401
    assert response.get_json() == {
        "error": {"message": "Admin authentication is required."}
    }


def test_list_seeded_concepts():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.get("/api/admin/concepts", headers=auth_headers(client))

    assert response.status_code == 200
    data = response.get_json()
    assert data["meta"]["total"] == 10
    assert [concept["key"] for concept in data["data"][:3]] == ["greeting", "mother", "father"]
    assert data["data"][0]["difficultyLevel"] == "beginner"
    assert "defaultImageUrl" in data["data"][0]


def test_get_one_concept():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    list_response = client.get("/api/admin/concepts?search=thank", headers=headers)
    thank_you = list_response.get_json()["data"][0]
    response = client.get(f"/api/admin/concepts/{thank_you['id']}", headers=headers)

    assert response.status_code == 200
    concept = response.get_json()["data"]
    assert concept["key"] == "thank_you"
    assert "defaultImageUrl" in concept


def test_create_concept_normalizes_values():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.post(
        "/api/admin/concepts",
        headers=auth_headers(client),
        json={
            "title": "  Good Morning  ",
            "key": " Good Morning ",
            "slug": "Good Morning",
            "description": "  A morning greeting.  ",
            "category": "  Greetings  ",
            "defaultImageUrl": "  /media/images/concepts/good-morning.png  ",
            "difficultyLevel": "Beginner",
            "status": "active",
            "sortOrder": "11",
        },
    )

    assert response.status_code == 201
    concept = response.get_json()["data"]
    assert concept["title"] == "Good Morning"
    assert concept["key"] == "good_morning"
    assert concept["slug"] == "good-morning"
    assert concept["description"] == "A morning greeting."
    assert concept["category"] == "Greetings"
    assert concept["defaultImageUrl"] == "/media/images/concepts/good-morning.png"
    assert concept["default_image_url"] == "/media/images/concepts/good-morning.png"
    assert concept["difficultyLevel"] == "beginner"
    assert concept["sortOrder"] == 11


def test_create_concept_rejects_duplicate_key_and_slug():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    duplicate_key_response = client.post(
        "/api/admin/concepts",
        headers=headers,
        json={
            "title": "Greeting Duplicate",
            "key": "GREETING",
            "slug": "greeting-duplicate",
            "difficultyLevel": "beginner",
            "status": "active",
            "sortOrder": 12,
        },
    )
    duplicate_slug_response = client.post(
        "/api/admin/concepts",
        headers=headers,
        json={
            "title": "Other Greeting",
            "key": "other_greeting",
            "slug": "GREETING",
            "difficultyLevel": "beginner",
            "status": "active",
            "sortOrder": 13,
        },
    )

    assert duplicate_key_response.status_code == 400
    assert duplicate_key_response.get_json()["error"]["fields"]["key"] == "Concept key already exists."
    assert duplicate_slug_response.status_code == 400
    assert duplicate_slug_response.get_json()["error"]["fields"]["slug"] == "Concept slug already exists."


def test_update_concept_and_status_flow():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    list_response = client.get("/api/admin/concepts?search=thank", headers=headers)
    thank_you = list_response.get_json()["data"][0]

    update_response = client.patch(
        f"/api/admin/concepts/{thank_you['id']}",
        headers=headers,
        json={
            "description": "A basic polite expression used to show gratitude.",
            "category": "Courtesy",
            "default_image_url": "/media/images/concepts/thank-you.png",
            "difficultyLevel": "intermediate",
            "sortOrder": 15,
        },
    )

    assert update_response.status_code == 200
    updated = update_response.get_json()["data"]
    assert updated["description"] == "A basic polite expression used to show gratitude."
    assert updated["defaultImageUrl"] == "/media/images/concepts/thank-you.png"
    assert updated["default_image_url"] == "/media/images/concepts/thank-you.png"
    assert updated["difficultyLevel"] == "intermediate"
    assert updated["sortOrder"] == 15

    disabled_response = client.patch(
        f"/api/admin/concepts/{thank_you['id']}/status",
        headers=headers,
        json={"status": "disabled"},
    )

    assert disabled_response.status_code == 200
    assert disabled_response.get_json()["data"]["status"] == "disabled"

    active_response = client.patch(
        f"/api/admin/concepts/{thank_you['id']}/status",
        headers=headers,
        json={"status": "active"},
    )

    assert active_response.status_code == 200
    assert active_response.get_json()["data"]["status"] == "active"


def test_search_and_filter_concepts():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    search_response = client.get("/api/admin/concepts?search=family", headers=headers)
    category_response = client.get("/api/admin/concepts?category=Family", headers=headers)
    difficulty_response = client.get(
        "/api/admin/concepts?difficultyLevel=beginner",
        headers=headers,
    )

    assert search_response.status_code == 200
    assert {concept["key"] for concept in search_response.get_json()["data"]} >= {"family"}
    assert category_response.status_code == 200
    assert {concept["key"] for concept in category_response.get_json()["data"]} >= {
        "mother",
        "father",
        "family",
    }
    assert difficulty_response.status_code == 200
    assert difficulty_response.get_json()["meta"]["total"] == 10


def test_filter_disabled_concepts():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    list_response = client.get("/api/admin/concepts?search=food", headers=headers)
    food = next(concept for concept in list_response.get_json()["data"] if concept["key"] == "food")
    client.patch(
        f"/api/admin/concepts/{food['id']}/status",
        headers=headers,
        json={"status": "disabled"},
    )

    disabled_response = client.get("/api/admin/concepts?status=disabled", headers=headers)

    assert disabled_response.status_code == 200
    data = disabled_response.get_json()
    assert data["meta"]["total"] == 1
    assert data["data"][0]["key"] == "food"
