from app.models.language import Language


STATUS_NEEDS_TRANSLATION = "needs_translation"
STATUS_HAS_REJECTED_TEXT = "has_rejected_text"
STATUS_DRAFT = "draft"
STATUS_NEEDS_REVIEW = "needs_review"
STATUS_COMPLETE = "complete"
STATUS_PUBLISHED = "published"

REVIEW_STATUS_DRAFT = "draft"
REVIEW_STATUS_NEEDS_REVIEW = "needs_review"
REVIEW_STATUS_APPROVED = "approved"
REVIEW_STATUS_REJECTED = "rejected"


def get_active_required_languages():
    return (
        Language.query.filter(
            Language.status == "active",
            Language.is_required_for_concept_completion.is_(True),
        )
        .order_by(Language.sort_order.asc(), Language.name.asc())
        .all()
    )


def calculate_concept_completion(concept, required_languages, concept_texts):
    active_required_languages = [
        language
        for language in required_languages
        if language.status == "active" and language.is_required_for_concept_completion
    ]
    active_texts_by_language_id = {
        concept_text.language_id: concept_text
        for concept_text in concept_texts
        if concept_text.status == "active"
    }

    missing_languages = []
    draft_languages = []
    needs_review_languages = []
    rejected_languages = []
    language_completion = []

    for language in active_required_languages:
        concept_text = active_texts_by_language_id.get(language.id)
        text_status = concept_text.review_status if concept_text is not None else None
        requires_review = language.requires_concept_text_review

        if concept_text is None:
            missing_languages.append(language.code)
        elif requires_review:
            if text_status == REVIEW_STATUS_REJECTED:
                rejected_languages.append(language.code)
            elif text_status == REVIEW_STATUS_DRAFT:
                draft_languages.append(language.code)
            elif text_status == REVIEW_STATUS_NEEDS_REVIEW:
                needs_review_languages.append(language.code)
            elif text_status != REVIEW_STATUS_APPROVED:
                needs_review_languages.append(language.code)

        language_completion.append(
            {
                "languageId": language.id,
                "languageCode": language.code,
                "languageName": language.name,
                "requiresConceptTextReview": requires_review,
                "hasText": concept_text is not None,
                "textStatus": text_status,
                "textId": concept_text.id if concept_text is not None else None,
                "text": concept_text.text if concept_text is not None else None,
                "pronunciation": concept_text.pronunciation if concept_text is not None else None,
            }
        )

    is_complete = (
        bool(active_required_languages)
        and not missing_languages
        and not rejected_languages
        and not draft_languages
        and not needs_review_languages
    )
    is_published = is_complete and getattr(concept, "published_at", None) is not None

    if missing_languages:
        completion_status = STATUS_NEEDS_TRANSLATION
    elif rejected_languages:
        completion_status = STATUS_HAS_REJECTED_TEXT
    elif draft_languages:
        completion_status = STATUS_DRAFT
    elif needs_review_languages:
        completion_status = STATUS_NEEDS_REVIEW
    elif is_published:
        completion_status = STATUS_PUBLISHED
    else:
        completion_status = STATUS_COMPLETE

    return {
        "completionStatus": completion_status,
        "isComplete": is_complete,
        "isReadyToPublish": completion_status == STATUS_COMPLETE,
        "missingLanguages": missing_languages,
        "draftLanguages": draft_languages,
        "needsReviewLanguages": needs_review_languages,
        "rejectedLanguages": rejected_languages,
        "languages": language_completion,
    }
