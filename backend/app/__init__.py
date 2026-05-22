from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.extensions import db, migrate
from app.routes.auth_routes import auth_bp
from app.routes.concept_text_audio_routes import concept_text_audio_bp, concept_text_audio_nested_bp
from app.routes.concept_text_routes import concept_text_bp
from app.routes.concept_routes import concept_bp
from app.routes.health_routes import health_bp
from app.routes.language_routes import language_bp
from app.routes.lesson_item_routes import lesson_item_bp, lesson_items_nested_bp
from app.routes.lesson_routes import lesson_bp
from app.seed import seed_admin_user, seed_concept_texts, seed_concepts, seed_languages, seed_test_content


def create_app(testing=False):
    app = Flask(__name__)
    app.config.from_object(Config)

    if testing:
        app.config.update(
            {
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
                "ADMIN_EMAIL": "admin@sounglah.com",
                "ADMIN_PASSWORD": "password",
                "SECRET_KEY": "test-secret-key-for-pytest-only",
            }
        )

    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(health_bp, url_prefix="/api/health")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(language_bp, url_prefix="/api/admin/languages")
    app.register_blueprint(concept_bp, url_prefix="/api/admin/concepts")
    app.register_blueprint(concept_text_bp, url_prefix="/api/admin/concept-texts")
    app.register_blueprint(concept_text_audio_nested_bp, url_prefix="/api/admin/concept-texts")
    app.register_blueprint(concept_text_audio_bp, url_prefix="/api/admin/concept-text-audios")
    app.register_blueprint(lesson_bp, url_prefix="/api/admin/lessons")
    app.register_blueprint(lesson_items_nested_bp, url_prefix="/api/admin/lessons")
    app.register_blueprint(lesson_item_bp, url_prefix="/api/admin/lesson-items")

    @app.cli.command("seed")
    def seed_command():
        seed_admin_user()
        seed_languages()
        seed_concepts()
        seed_concept_texts()
        print("Seeded Sounglah admin data.")

    with app.app_context():
        from app import models  # noqa: F401

        if testing:
            db.create_all()
            seed_admin_user()
            seed_languages()
            seed_test_content()

    return app
