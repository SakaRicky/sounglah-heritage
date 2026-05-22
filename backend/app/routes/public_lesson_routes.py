from flask import Blueprint, jsonify

from app.services.lesson_public_service import (
    get_published_lesson_by_slug,
    list_published_lessons,
    published_lesson_to_detail,
)

lessons_bp = Blueprint("public_lessons", __name__)


@lessons_bp.get("")
def list_lessons():
    return jsonify({"data": list_published_lessons()})


@lessons_bp.get("/<slug>")
def get_lesson(slug):
    lesson = get_published_lesson_by_slug(slug)
    if lesson is None:
        return jsonify({"error": {"message": "Lesson not found."}}), 404

    return jsonify(published_lesson_to_detail(lesson))
