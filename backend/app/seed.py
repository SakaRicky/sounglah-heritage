from flask import current_app
from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models.user import User


def seed_admin_user():
    email = current_app.config["ADMIN_EMAIL"].strip().lower()
    password = current_app.config["ADMIN_PASSWORD"]

    if User.query.filter_by(email=email).first():
        return

    user = User(
        email=email,
        password_hash=generate_password_hash(password, method="pbkdf2:sha256"),
    )
    db.session.add(user)
    db.session.commit()
