from io import BytesIO
from unittest.mock import patch

from app import create_app
from app.extensions import db
from app.models.concept import Concept
from app.models.concept_text import ConceptText
from app.models.language import Language


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
    assert "image_url" in data["data"][0]
    assert "image_public_id" in data["data"][0]
    assert "image_alt_text" in data["data"][0]
    assert "publishedAt" in data["data"][0]
    assert data["data"][0]["isPublished"] is False


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
    assert "image_url" in concept
    assert "image_public_id" in concept
    assert "image_alt_text" in concept
    assert "publishedAt" in concept
    assert concept["isPublished"] is False


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
            "title": "Thank You Duplicate",
            "key": "THANK YOU",
            "slug": "thank-you-duplicate",
            "difficultyLevel": "beginner",
            "status": "active",
            "sortOrder": 12,
        },
    )
    duplicate_slug_response = client.post(
        "/api/admin/concepts",
        headers=headers,
        json={
            "title": "Other Thank You",
            "key": "other_thank_you",
            "slug": "THANK-YOU",
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


def test_publish_concept_requires_admin_authentication():
    app = create_app(testing=True)
    client = app.test_client()

    with app.app_context():
        concept_id = Concept.query.filter_by(key="greeting").first().id

    response = client.post(f"/api/admin/concepts/{concept_id}/publish")

    assert response.status_code == 401
    assert response.get_json() == {
        "error": {"message": "Admin authentication is required."}
    }


def test_publish_concept_rejects_incomplete_concept():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    with app.app_context():
        concept_id = Concept.query.filter_by(key="yes").first().id

    response = client.post(f"/api/admin/concepts/{concept_id}/publish", headers=headers)

    assert response.status_code == 400
    data = response.get_json()
    assert (
        data["error"]["message"]
        == "Concept cannot be published because required texts are missing or not approved."
    )
    assert data["missingLanguages"] == ["med", "en", "fr"]
    assert data["draftLanguages"] == []
    assert data["needsReviewLanguages"] == []
    assert data["rejectedLanguages"] == []


def test_publish_concept_when_required_texts_are_approved():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)

    with app.app_context():
        concept = Concept.query.filter_by(key="greeting").first()
        medumba = Language.query.filter_by(code="med").first()
        db.session.add(
            ConceptText(
                concept_id=concept.id,
                language_id=medumba.id,
                text="Mbote",
                status="active",
                review_status="approved",
            )
        )
        db.session.commit()
        concept_id = concept.id

    response = client.post(f"/api/admin/concepts/{concept_id}/publish", headers=headers)

    assert response.status_code == 200
    data = response.get_json()["data"]
    assert data["publishedAt"] is not None
    assert data["isPublished"] is True

    with app.app_context():
        concept = db.session.get(Concept, concept_id)
        assert concept.published_at is not None


def test_concept_image_upload_requires_admin_authentication():
    app = create_app(testing=True)
    client = app.test_client()

    with app.app_context():
        concept_id = Concept.query.filter_by(key="greeting").first().id

    response = client.post(
        f"/api/admin/concepts/{concept_id}/image",
        data={"image": (BytesIO(b"image-bytes"), "greeting.png")},
        content_type="multipart/form-data",
    )

    assert response.status_code == 401
    assert response.get_json() == {
        "error": {"message": "Admin authentication is required."}
    }


def test_concept_image_upload_allows_cors_preflight_without_authentication():
    app = create_app(testing=True)
    client = app.test_client()

    with app.app_context():
        concept_id = Concept.query.filter_by(key="greeting").first().id

    response = client.options(
        f"/api/admin/concepts/{concept_id}/image",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization",
        },
    )

    assert response.status_code == 200
    assert response.headers["Access-Control-Allow-Origin"] == "http://localhost:5173"


def test_concept_image_upload_rejects_invalid_file_type():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    with app.app_context():
        concept_id = Concept.query.filter_by(key="greeting").first().id

    response = client.post(
        f"/api/admin/concepts/{concept_id}/image",
        headers=headers,
        data={"image": (BytesIO(b"not-an-image"), "greeting.txt")},
        content_type="multipart/form-data",
    )

    assert response.status_code == 400
    assert response.get_json()["error"]["fields"]["image"] == "Image must be a JPEG, PNG, or WebP file."


def test_concept_image_upload_saves_cloudinary_fields_and_alt_text():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    with app.app_context():
        concept_id = Concept.query.filter_by(key="greeting").first().id

    with patch("app.routes.concept_routes.cloudinary_service.upload_concept_image") as upload_mock:
        upload_mock.return_value = {
            "secure_url": "https://res.cloudinary.com/demo/image/upload/greeting.jpg",
            "public_id": "sounglah/concepts/greeting",
        }
        response = client.post(
            f"/api/admin/concepts/{concept_id}/image",
            headers=headers,
            data={
                "image": (BytesIO(b"image-bytes"), "greeting.jpg"),
                "image_alt_text": "A family greeting each other",
            },
            content_type="multipart/form-data",
        )

    assert response.status_code == 200
    data = response.get_json()["data"]
    assert data["image_url"] == "https://res.cloudinary.com/demo/image/upload/greeting.jpg"
    assert data["image_public_id"] == "sounglah/concepts/greeting"
    assert data["image_alt_text"] == "A family greeting each other"
    upload_mock.assert_called_once()


def test_concept_image_upload_uses_upload_root_concepts_folder():
    app = create_app(testing=True)
    app.config.update(
        {
            "CLOUDINARY_CLOUD_NAME": "demo",
            "CLOUDINARY_API_KEY": "key",
            "CLOUDINARY_API_SECRET": "secret",
            "CLOUDINARY_UPLOAD_ROOT": "sounglah/test",
        }
    )
    client = app.test_client()
    headers = auth_headers(client)
    with app.app_context():
        concept_id = Concept.query.filter_by(key="greeting").first().id

    with patch("app.services.cloudinary_service.uploader.upload") as cloudinary_upload_mock:
        cloudinary_upload_mock.return_value = {
            "secure_url": "https://res.cloudinary.com/demo/image/upload/greeting.jpg",
            "public_id": "sounglah/test/concepts/greeting",
        }
        response = client.post(
            f"/api/admin/concepts/{concept_id}/image",
            headers=headers,
            data={"image": (BytesIO(b"image-bytes"), "greeting.jpg")},
            content_type="multipart/form-data",
        )

    assert response.status_code == 200
    assert cloudinary_upload_mock.call_args.kwargs["folder"] == "sounglah/test/concepts"


def test_update_concept_image_alt_text_only():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    with app.app_context():
        concept = Concept.query.filter_by(key="greeting").first()
        concept_id = concept.id
        concept.image_url = "https://res.cloudinary.com/demo/image/upload/greeting.jpg"
        concept.image_public_id = "sounglah/concepts/greeting"
        db.session.commit()

    response = client.patch(
        f"/api/admin/concepts/{concept_id}/image-alt-text",
        headers=headers,
        json={"image_alt_text": "Grandparents greeting a child"},
    )

    assert response.status_code == 200
    data = response.get_json()["data"]
    assert data["image_url"] == "https://res.cloudinary.com/demo/image/upload/greeting.jpg"
    assert data["image_public_id"] == "sounglah/concepts/greeting"
    assert data["image_alt_text"] == "Grandparents greeting a child"


def test_delete_concept_image_clears_fields():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    with app.app_context():
        concept = Concept.query.filter_by(key="greeting").first()
        concept_id = concept.id
        concept.image_url = "https://res.cloudinary.com/demo/image/upload/greeting.jpg"
        concept.image_public_id = "sounglah/concepts/greeting"
        concept.image_alt_text = "A greeting"
        db.session.commit()

    with patch("app.routes.concept_routes.cloudinary_service.delete_image") as delete_mock:
        response = client.delete(f"/api/admin/concepts/{concept_id}/image", headers=headers)

    assert response.status_code == 200
    data = response.get_json()["data"]
    assert data["image_url"] is None
    assert data["image_public_id"] is None
    assert data["image_alt_text"] is None
    delete_mock.assert_called_once_with("sounglah/concepts/greeting")


def test_replacing_concept_image_deletes_old_public_id_after_new_upload():
    app = create_app(testing=True)
    client = app.test_client()
    headers = auth_headers(client)
    with app.app_context():
        concept = Concept.query.filter_by(key="greeting").first()
        concept_id = concept.id
        concept.image_url = "https://res.cloudinary.com/demo/image/upload/old.jpg"
        concept.image_public_id = "sounglah/concepts/old"
        concept.image_alt_text = "Old alt text"
        db.session.commit()

    with (
        patch("app.routes.concept_routes.cloudinary_service.upload_concept_image") as upload_mock,
        patch("app.routes.concept_routes.cloudinary_service.delete_image") as delete_mock,
    ):
        upload_mock.return_value = {
            "secure_url": "https://res.cloudinary.com/demo/image/upload/new.jpg",
            "public_id": "sounglah/concepts/new",
        }
        response = client.post(
            f"/api/admin/concepts/{concept_id}/image",
            headers=headers,
            data={"image": (BytesIO(b"new-image-bytes"), "new.webp")},
            content_type="multipart/form-data",
        )

    assert response.status_code == 200
    data = response.get_json()["data"]
    assert data["image_url"] == "https://res.cloudinary.com/demo/image/upload/new.jpg"
    assert data["image_public_id"] == "sounglah/concepts/new"
    assert data["image_alt_text"] == "Old alt text"
    upload_mock.assert_called_once()
    delete_mock.assert_called_once_with("sounglah/concepts/old")
