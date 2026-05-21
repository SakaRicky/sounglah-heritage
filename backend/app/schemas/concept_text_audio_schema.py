def _format_timestamp(value):
    if value is None:
        return None

    timestamp = value.isoformat()
    if timestamp.endswith("+00:00"):
        return timestamp.replace("+00:00", "Z")

    return f"{timestamp}Z"


def _concept_text_summary(concept_text):
    if concept_text is None:
        return None

    return {
        "id": concept_text.id,
        "text": concept_text.text,
        "conceptId": concept_text.concept_id,
        "languageId": concept_text.language_id,
        "concept": {
            "id": concept_text.concept.id,
            "key": concept_text.concept.key,
            "title": concept_text.concept.title,
        }
        if concept_text.concept is not None
        else None,
        "language": {
            "id": concept_text.language.id,
            "name": concept_text.language.name,
            "code": concept_text.language.code,
        }
        if concept_text.language is not None
        else None,
    }


def concept_text_audio_to_dict(audio, include_concept_text=False):
    data = {
        "id": audio.id,
        "conceptTextId": audio.concept_text_id,
        "concept_text_id": audio.concept_text_id,
        "audioUrl": audio.audio_url,
        "audio_url": audio.audio_url,
        "audioPublicId": audio.audio_public_id,
        "audio_public_id": audio.audio_public_id,
        "storageProvider": audio.storage_provider,
        "storage_provider": audio.storage_provider,
        "durationSeconds": audio.duration_seconds,
        "duration_seconds": audio.duration_seconds,
        "fileSizeBytes": audio.file_size_bytes,
        "file_size_bytes": audio.file_size_bytes,
        "mimeType": audio.mime_type,
        "mime_type": audio.mime_type,
        "status": audio.status,
        "recordedByUserId": audio.recorded_by_user_id,
        "recorded_by_user_id": audio.recorded_by_user_id,
        "reviewedByUserId": audio.reviewed_by_user_id,
        "reviewed_by_user_id": audio.reviewed_by_user_id,
        "reviewNote": audio.review_note,
        "review_note": audio.review_note,
        "createdAt": _format_timestamp(audio.created_at),
        "updatedAt": _format_timestamp(audio.updated_at),
        "submittedAt": _format_timestamp(audio.submitted_at),
        "approvedAt": _format_timestamp(audio.approved_at),
        "rejectedAt": _format_timestamp(audio.rejected_at),
    }

    if include_concept_text:
        data["conceptText"] = _concept_text_summary(audio.concept_text)
        data["concept_text"] = data["conceptText"]

    return data
