def _format_timestamp(value):
    if value is None:
        return None

    timestamp = value.isoformat()
    if timestamp.endswith("+00:00"):
        return timestamp.replace("+00:00", "Z")

    return f"{timestamp}Z"


def _concept_summary(concept):
    if concept is None:
        return None

    return {
        "id": concept.id,
        "key": concept.key,
        "title": concept.title,
    }


def _language_summary(language):
    if language is None:
        return None

    return {
        "id": language.id,
        "name": language.name,
        "code": language.code,
    }


def concept_text_to_dict(concept_text, include_relationships=True, audio_summary=None):
    data = {
        "id": concept_text.id,
        "conceptId": concept_text.concept_id,
        "languageId": concept_text.language_id,
        "text": concept_text.text,
        "pronunciation": concept_text.pronunciation,
        "audioUrl": concept_text.audio_url,
        "audio_url": concept_text.audio_url,
        "currentAudioId": concept_text.current_audio_id,
        "current_audio_id": concept_text.current_audio_id,
        "pronunciationNote": concept_text.pronunciation_note,
        "pronunciation_note": concept_text.pronunciation_note,
        "literalMeaning": concept_text.literal_meaning,
        "usageNote": concept_text.usage_note,
        "status": concept_text.status,
        "reviewStatus": concept_text.review_status,
        "createdAt": _format_timestamp(concept_text.created_at),
        "updatedAt": _format_timestamp(concept_text.updated_at),
    }

    if include_relationships:
        data["concept"] = _concept_summary(concept_text.concept)
        data["language"] = _language_summary(concept_text.language)

    if audio_summary is not None:
        data["audioSummary"] = audio_summary
        data["audio_summary"] = {
            "status": audio_summary["status"],
            "current_audio_id": audio_summary["currentAudioId"],
            "current_audio_url": audio_summary["currentAudioUrl"],
            "pending_audio_id": audio_summary["pendingAudioId"],
            "pending_audio_url": audio_summary["pendingAudioUrl"],
            "duration_seconds": audio_summary["durationSeconds"],
        }

    return data
