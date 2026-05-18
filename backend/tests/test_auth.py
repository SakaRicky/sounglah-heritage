from app import create_app


def test_login_success():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.post(
        "/api/auth/login",
        json={"email": "admin@sounglah.com", "password": "password"},
    )

    assert response.status_code == 200
    data = response.get_json()
    assert "token" in data
    assert isinstance(data["token"], str)
    assert len(data["token"]) > 0


def test_login_wrong_password():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.post(
        "/api/auth/login",
        json={"email": "admin@sounglah.com", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.get_json() == {"message": "Invalid email or password."}


def test_login_missing_fields():
    app = create_app(testing=True)
    client = app.test_client()

    response = client.post("/api/auth/login", json={"email": "admin@sounglah.com"})

    assert response.status_code == 400
    assert response.get_json() == {"message": "Email and password are required."}
