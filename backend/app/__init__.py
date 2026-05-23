import click
from flask import Flask, current_app, send_from_directory
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
from app.routes.public_lesson_routes import lessons_bp
from app.seed import reset_seed_data, seed_admin_user, seed_starter_curriculum, seed_test_content


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
                "MEDIA_STORAGE_PROVIDER": "cloudinary",
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
    app.register_blueprint(lessons_bp, url_prefix="/api/lessons")

    @app.cli.command("seed")
    @click.option(
        "--reset",
        is_flag=True,
        help="Delete existing local data before loading the curated starter curriculum.",
    )
    def seed_command(reset):
        if reset:
            reset_seed_data()
        seed_admin_user()
        seed_starter_curriculum()
        print("Seeded Sounglah curated starter curriculum.")

    @app.get("/media/<path:filename>")
    def local_media(filename):
        mimetype = None
        normalized = filename.lower()
        if normalized.endswith(".webm") and normalized.startswith("concept-text-audios/"):
            mimetype = "audio/webm"

        return send_from_directory(
            current_app.config["LOCAL_MEDIA_ROOT"],
            filename,
            mimetype=mimetype,
        )

    with app.app_context():
        from app import models  # noqa: F401

        if testing:
            db.create_all()
            seed_admin_user()
            seed_test_content()

    return app
