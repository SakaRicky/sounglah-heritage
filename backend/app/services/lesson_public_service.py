from sqlalchemy import func

from app.extensions import db
from app.models.concept import Concept
from app.models.concept_text import ConceptText
from app.models.concept_text_audio import ConceptTextAudio
from app.models.language import Language
from app.models.lesson import Lesson
from app.models.lesson_item import LessonItem

PUBLIC_TEXT_LANGUAGE_CODES = ("en", "fr", "med")


def _active_item_counts(lesson_ids):
    if not lesson_ids:
        return {}

    rows = (
        db.session.query(LessonItem.lesson_id, func.count(LessonItem.id))
        .filter(LessonItem.lesson_id.in_(lesson_ids), LessonItem.is_active.is_(True))
        .group_by(LessonItem.lesson_id)
        .all()
    )
    return {lesson_id: count for lesson_id, count in rows}


def _text_entry(concept_text, include_audio=False):
    entry = {
        "text": concept_text.text,
        "pronunciation": concept_text.pronunciation,
        "audioUrl": None,
    }

    if include_audio:
        audio_url = None
        has_approved_audio = False
        if concept_text.current_audio_id:
            current_audio = concept_text.current_audio
            if (
                current_audio is not None
                and current_audio.status == ConceptTextAudio.STATUS_APPROVED
            ):
                audio_url = current_audio.audio_url
                has_approved_audio = True

        entry["audioUrl"] = audio_url
        entry["hasApprovedAudio"] = has_approved_audio

    return entry


def build_concept_payload(concept_id):
    if not concept_id:
        return None

    concept = db.session.get(Concept, concept_id)
    if concept is None or concept.status != "active":
        return None

    language_rows = (
        db.session.query(Language.code, ConceptText)
        .join(ConceptText, ConceptText.language_id == Language.id)
        .filter(
            ConceptText.concept_id == concept.id,
            ConceptText.status == "active",
            Language.code.in_(PUBLIC_TEXT_LANGUAGE_CODES),
        )
        .all()
    )

    texts = {}
    for language_code, concept_text in language_rows:
        texts[language_code] = _text_entry(
            concept_text,
            include_audio=language_code == "med",
        )

    return {
        "id": concept.id,
        "key": concept.key,
        "imageUrl": concept.image_url or concept.default_image_url,
        "imageAltText": concept.image_alt_text,
        "texts": texts,
    }


def published_lesson_to_list_item(lesson, active_item_count):
    return {
        "slug": lesson.slug,
        "title": lesson.title,
        "description": lesson.description,
        "difficulty": lesson.difficulty,
        "estimatedMinutes": lesson.estimated_minutes,
        "coverImageUrl": lesson.cover_image_url,
        "coverImageAltText": lesson.cover_image_alt_text,
        "activeItemCount": active_item_count,
    }


def published_lesson_item_to_dict(item):
    return {
        "id": item.id,
        "type": item.type,
        "title": item.title,
        "instructionText": item.instruction_text,
        "orderIndex": item.order_index,
        "contentJson": item.content_json or {},
        "conceptPayload": build_concept_payload(item.concept_id),
    }


def published_lesson_to_detail(lesson):
    active_items = [
        item for item in lesson.items if item.is_active
    ]
    active_items.sort(key=lambda item: item.order_index)

    return {
        "slug": lesson.slug,
        "title": lesson.title,
        "description": lesson.description,
        "difficulty": lesson.difficulty,
        "estimatedMinutes": lesson.estimated_minutes,
        "coverImageUrl": lesson.cover_image_url,
        "coverImageAltText": lesson.cover_image_alt_text,
        "items": [published_lesson_item_to_dict(item) for item in active_items],
    }


def list_published_lessons():
    lessons = (
        Lesson.query.filter(Lesson.status == "published")
        .order_by(Lesson.order_index.asc(), Lesson.title.asc())
        .all()
    )
    item_counts = _active_item_counts([lesson.id for lesson in lessons])
    return [
        published_lesson_to_list_item(lesson, item_counts.get(lesson.id, 0))
        for lesson in lessons
    ]


def get_published_lesson_by_slug(slug):
    normalized_slug = (slug or "").strip().lower()
    if not normalized_slug:
        return None

    return Lesson.query.filter(
        Lesson.slug == normalized_slug,
        Lesson.status == "published",
    ).first()
