from datetime import datetime, timezone

from app import create_app
from app.extensions import db
from app.models.concept import Concept
from app.models.concept_text import ConceptText
from app.models.concept_text_audio import ConceptTextAudio
from app.models.language import Language
from app.services.concept_completion_service import (
    STATUS_COMPLETE,
    STATUS_DRAFT,
    STATUS_HAS_REJECTED_TEXT,
    STATUS_NEEDS_AUDIO,
    STATUS_NEEDS_REVIEW,
    STATUS_NEEDS_TRANSLATION,
    STATUS_PUBLISHED,
    calculate_concept_completion,
    get_active_required_languages,
    is_concept_ready_for_lesson_items,
)


def _concept_and_required_languages():
    concept = Concept.query.filter_by(key="yes").first()
    required_languages = get_active_required_languages()
    return concept, required_languages


def _add_required_texts(concept, statuses_by_language_code):
    languages_by_code = {language.code: language for language in Language.query.all()}
    concept_texts = []

    for language_code, review_status in statuses_by_language_code.items():
        concept_text = ConceptText(
            concept_id=concept.id,
            language_id=languages_by_code[language_code].id,
            text=f"{language_code} text",
            status="active",
            review_status=review_status,
        )
        db.session.add(concept_text)
        concept_texts.append(concept_text)

    db.session.commit()
    return concept_texts


def _add_audio(concept_text, status=ConceptTextAudio.STATUS_APPROVED):
    audio = ConceptTextAudio(
        concept_text_id=concept_text.id,
        audio_url=f"https://cdn.example.com/{concept_text.id}.webm",
        status=status,
        duration_seconds=3,
        mime_type="audio/webm",
    )
    db.session.add(audio)
    db.session.flush()

    if status == ConceptTextAudio.STATUS_APPROVED:
        concept_text.set_current_audio(audio)

    db.session.commit()
    return audio


def _add_approved_audio_for_language(concept_texts, language_code):
    language = Language.query.filter_by(code=language_code).first()
    concept_text = next(
        item for item in concept_texts if item.language_id == language.id
    )
    return _add_audio(concept_text)


def test_completion_reports_missing_required_texts():
    app = create_app(testing=True)

    with app.app_context():
        concept, required_languages = _concept_and_required_languages()

        completion = calculate_concept_completion(concept, required_languages, [])

        assert completion["completionStatus"] == STATUS_NEEDS_TRANSLATION
        assert completion["isComplete"] is False
        assert completion["isReadyToPublish"] is False
        assert completion["missingLanguages"] == ["med", "en", "fr"]
        assert [item["languageCode"] for item in completion["languages"]] == ["med", "en", "fr"]
        assert all(item["hasText"] is False for item in completion["languages"])
        assert all(item["text"] is None for item in completion["languages"])


def test_completion_reports_rejected_before_draft_or_review():
    app = create_app(testing=True)

    with app.app_context():
        concept, required_languages = _concept_and_required_languages()
        concept_texts = _add_required_texts(
            concept,
            {
                "med": "rejected",
                "en": "draft",
                "fr": "needs_review",
            },
        )

        completion = calculate_concept_completion(concept, required_languages, concept_texts)

        assert completion["completionStatus"] == STATUS_HAS_REJECTED_TEXT
        assert completion["rejectedLanguages"] == ["med"]
        assert completion["draftLanguages"] == []
        assert completion["needsReviewLanguages"] == []
        assert completion["languages"][0]["text"] == "med text"


def test_completion_reports_draft_before_needs_review():
    app = create_app(testing=True)

    with app.app_context():
        concept, required_languages = _concept_and_required_languages()
        concept_texts = _add_required_texts(
            concept,
            {
                "med": "draft",
                "en": "draft",
                "fr": "needs_review",
            },
        )

        completion = calculate_concept_completion(concept, required_languages, concept_texts)

        assert completion["completionStatus"] == STATUS_DRAFT
        assert completion["draftLanguages"] == ["med"]
        assert completion["needsReviewLanguages"] == []


def test_completion_reports_needs_review_when_heritage_text_is_not_approved():
    app = create_app(testing=True)

    with app.app_context():
        concept, required_languages = _concept_and_required_languages()
        concept_texts = _add_required_texts(
            concept,
            {
                "med": "needs_review",
                "en": "approved",
                "fr": "needs_review",
            },
        )

        completion = calculate_concept_completion(concept, required_languages, concept_texts)

        assert completion["completionStatus"] == STATUS_NEEDS_REVIEW
        assert completion["needsReviewLanguages"] == ["med"]


def test_completion_ignores_english_and_french_review_status_when_heritage_is_approved():
    app = create_app(testing=True)

    with app.app_context():
        concept, required_languages = _concept_and_required_languages()
        concept_texts = _add_required_texts(
            concept,
            {
                "med": "approved",
                "en": "draft",
                "fr": "needs_review",
            },
        )
        _add_approved_audio_for_language(concept_texts, "med")

        completion = calculate_concept_completion(concept, required_languages, concept_texts)

        assert completion["completionStatus"] == STATUS_COMPLETE
        assert completion["isComplete"] is True
        assert completion["isReadyToPublish"] is True
        assert completion["draftLanguages"] == []
        assert completion["needsReviewLanguages"] == []


def test_completion_reports_needs_audio_when_heritage_text_is_approved_without_audio():
    app = create_app(testing=True)

    with app.app_context():
        concept, required_languages = _concept_and_required_languages()
        concept_texts = _add_required_texts(
            concept,
            {
                "med": "approved",
                "en": "approved",
                "fr": "approved",
            },
        )

        completion = calculate_concept_completion(concept, required_languages, concept_texts)

        assert completion["completionStatus"] == STATUS_NEEDS_AUDIO
        assert completion["isComplete"] is False
        assert completion["isReadyToPublish"] is False
        assert completion["needsAudioLanguages"] == ["med"]
        medumba_completion = completion["languages"][0]
        assert medumba_completion["requiresAudio"] is True
        assert medumba_completion["hasApprovedAudio"] is False
        assert medumba_completion["audioStatus"] == "missing"


def test_completion_reports_pending_audio_before_complete():
    app = create_app(testing=True)

    with app.app_context():
        concept, required_languages = _concept_and_required_languages()
        concept_texts = _add_required_texts(
            concept,
            {
                "med": "approved",
                "en": "approved",
                "fr": "approved",
            },
        )
        language = Language.query.filter_by(code="med").first()
        medumba_text = next(item for item in concept_texts if item.language_id == language.id)
        _add_audio(medumba_text, ConceptTextAudio.STATUS_PENDING_REVIEW)

        completion = calculate_concept_completion(concept, required_languages, concept_texts)

        assert completion["completionStatus"] == STATUS_NEEDS_AUDIO
        assert completion["needsAudioLanguages"] == ["med"]
        assert completion["languages"][0]["audioStatus"] == ConceptTextAudio.STATUS_PENDING_REVIEW


def test_completion_reports_complete_when_required_texts_and_audio_are_approved():
    app = create_app(testing=True)

    with app.app_context():
        concept, required_languages = _concept_and_required_languages()
        concept_texts = _add_required_texts(
            concept,
            {
                "med": "approved",
                "en": "approved",
                "fr": "approved",
            },
        )
        _add_approved_audio_for_language(concept_texts, "med")

        completion = calculate_concept_completion(concept, required_languages, concept_texts)

        assert completion["completionStatus"] == STATUS_COMPLETE
        assert completion["isComplete"] is True
        assert completion["isReadyToPublish"] is True
        assert completion["missingLanguages"] == []
        assert completion["draftLanguages"] == []
        assert completion["needsReviewLanguages"] == []
        assert completion["needsAudioLanguages"] == []
        assert completion["rejectedLanguages"] == []
        medumba_completion = completion["languages"][0]
        assert medumba_completion["hasApprovedAudio"] is True
        assert medumba_completion["audioStatus"] == ConceptTextAudio.STATUS_APPROVED


def test_completion_reports_published_when_complete_with_audio_and_published_at_exists():
    app = create_app(testing=True)

    with app.app_context():
        concept, required_languages = _concept_and_required_languages()
        concept.published_at = datetime.now(timezone.utc)
        concept_texts = _add_required_texts(
            concept,
            {
                "med": "approved",
                "en": "approved",
                "fr": "approved",
            },
        )
        _add_approved_audio_for_language(concept_texts, "med")

        completion = calculate_concept_completion(concept, required_languages, concept_texts)

        assert completion["completionStatus"] == STATUS_PUBLISHED
        assert completion["isComplete"] is True
        assert completion["isReadyToPublish"] is False


def test_completion_ignores_disabled_required_language_and_disabled_text():
    app = create_app(testing=True)

    with app.app_context():
        concept, required_languages = _concept_and_required_languages()
        medumba = Language.query.filter_by(code="med").first()
        english = Language.query.filter_by(code="en").first()
        medumba.status = "disabled"
        db.session.commit()
        concept_texts = _add_required_texts(
            concept,
            {
                "med": "approved",
                "en": "approved",
                "fr": "approved",
            },
        )
        _add_approved_audio_for_language(concept_texts, "med")
        english_text = next(
            concept_text for concept_text in concept_texts if concept_text.language_id == english.id
        )
        english_text.status = "disabled"
        db.session.commit()

        completion = calculate_concept_completion(concept, required_languages, concept_texts)

        assert completion["completionStatus"] == STATUS_NEEDS_TRANSLATION
        assert completion["missingLanguages"] == ["en"]
        assert [item["languageCode"] for item in completion["languages"]] == ["en", "fr"]


def test_is_concept_ready_for_lesson_items_requires_active_complete_concept():
    app = create_app(testing=True)

    with app.app_context():
        concept, required_languages = _concept_and_required_languages()
        assert is_concept_ready_for_lesson_items(concept) is False

        concept_texts = _add_required_texts(
            concept,
            {
                "med": "approved",
                "en": "approved",
                "fr": "approved",
            },
        )
        _add_approved_audio_for_language(concept_texts, "med")
        assert is_concept_ready_for_lesson_items(concept, concept_texts) is True

        concept.status = "disabled"
        assert is_concept_ready_for_lesson_items(concept, concept_texts) is False
