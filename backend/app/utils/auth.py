from functools import wraps

import jwt
from flask import current_app, g, jsonify, request

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

        g.current_user = user
        return view(*args, **kwargs)

    return wrapped


CONCEPT_TEXT_AUDIO_PERMISSIONS = {
    "read": "concept_text_audio:read",
    "create": "concept_text_audio:create",
    "replace": "concept_text_audio:replace",
    "review": "concept_text_audio:review",
    "approve": "concept_text_audio:approve",
    "reject": "concept_text_audio:reject",
    "archive": "concept_text_audio:archive",
}


def current_user_can_concept_text_audio(_permission):
    # MVP: all authenticated admin users can perform concept text audio actions.
    # Keep this function as the single upgrade point when roles are added.
    return getattr(g, "current_user", None) is not None


def require_concept_text_audio_permission(permission):
    def decorator(view):
        @require_admin
        @wraps(view)
        def wrapped(*args, **kwargs):
            if not current_user_can_concept_text_audio(permission):
                return jsonify({"error": {"message": "You do not have permission to manage concept text audio."}}), 403

            return view(*args, **kwargs)

        return wrapped

    return decorator
