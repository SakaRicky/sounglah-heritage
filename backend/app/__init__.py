from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db
from app.routes.auth_routes import auth_bp
from app.routes.health_routes import health_bp
from app.seed import seed_admin_user


def create_app(testing=False):
    load_dotenv()

    app = Flask(__name__)
    app.config.from_object(Config)

    if testing:
        app.config.update(
            {
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            }
        )

    CORS(app)

    db.init_app(app)

    app.register_blueprint(health_bp, url_prefix="/api/health")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    with app.app_context():
        from app import models  # noqa: F401

        db.create_all()
        seed_admin_user()

    return app
