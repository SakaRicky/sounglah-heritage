from functools import wraps

import jwt
from flask import current_app, jsonify, request

from app.models.user import User
from app.extensions import db


def require_admin(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if request.method == "OPTIONS":
            return current_app.make_default_options_response()

        auth_header = request.headers.get("Authorization", "")
        prefix = "Bearer "

        if not auth_header.startswith(prefix):
            return jsonify({"error": {"message": "Admin authentication is required."}}), 401

        token = auth_header[len(prefix) :].strip()

        try:
            payload = jwt.decode(
                token,
                current_app.config["SECRET_KEY"],
                algorithms=["HS256"],
            )
        except jwt.PyJWTError:
            return jsonify({"error": {"message": "Admin authentication is required."}}), 401

        try:
            user_id = int(payload.get("sub"))
        except (TypeError, ValueError):
            return jsonify({"error": {"message": "Admin authentication is required."}}), 401

        user = db.session.get(User, user_id)
        if user is None:
            return jsonify({"error": {"message": "Admin authentication is required."}}), 401

        return view(*args, **kwargs)

    return wrapped
