from datetime import datetime, timedelta, timezone

import jwt
from flask import Blueprint, current_app, jsonify, request
from werkzeug.security import check_password_hash

from app.models.user import User

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    normalized_email = email.strip().lower()
    user = User.query.filter_by(email=normalized_email).first()

    if user is None or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid email or password."}), 401

    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    token = jwt.encode(
        {
            "sub": str(user.id),
            "email": user.email,
            "exp": expires_at,
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )

    return jsonify({"token": token})
