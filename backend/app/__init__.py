from flask import Flask
from flask_cors import CORS

from app.config import Config
from app.routes.health_routes import health_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)

    app.register_blueprint(health_bp, url_prefix="/api/health")

    return app
