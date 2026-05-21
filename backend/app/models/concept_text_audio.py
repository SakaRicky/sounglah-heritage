from datetime import datetime, timezone
from uuid import uuid4

from app.extensions import db


class ConceptTextAudio(db.Model):
    __tablename__ = "concept_text_audios"

    STATUS_DRAFT = "draft"
    STATUS_PENDING_REVIEW = "pending_review"
    STATUS_APPROVED = "approved"
    STATUS_REJECTED = "rejected"
    STATUS_ARCHIVED = "archived"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    concept_text_id = db.Column(
        db.String(36),
        db.ForeignKey("concept_texts.id"),
        nullable=False,
        index=True,
    )
    audio_url = db.Column(db.String(500), nullable=False)
    audio_public_id = db.Column(db.String(255), nullable=True)
    storage_provider = db.Column(db.String(50), nullable=False, default="cloudinary")
    duration_seconds = db.Column(db.Integer, nullable=True)
    file_size_bytes = db.Column(db.Integer, nullable=True)
    mime_type = db.Column(db.String(120), nullable=True)
    status = db.Column(db.String(30), nullable=False, default=STATUS_DRAFT, index=True)
    recorded_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    reviewed_by_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    review_note = db.Column(db.Text, nullable=True)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    submitted_at = db.Column(db.DateTime(timezone=True), nullable=True)
    approved_at = db.Column(db.DateTime(timezone=True), nullable=True)
    rejected_at = db.Column(db.DateTime(timezone=True), nullable=True)

    concept_text = db.relationship(
        "ConceptText",
        back_populates="audio_attempts",
        foreign_keys=[concept_text_id],
    )
    recorded_by_user = db.relationship("User", foreign_keys=[recorded_by_user_id])
    reviewed_by_user = db.relationship("User", foreign_keys=[reviewed_by_user_id])

    __table_args__ = (
        db.CheckConstraint(
            "status IN ('draft', 'pending_review', 'approved', 'rejected', 'archived')",
            name="concept_text_audios_status_check",
        ),
        db.CheckConstraint(
            "length(trim(audio_url)) > 0",
            name="concept_text_audios_audio_url_not_empty_check",
        ),
        db.CheckConstraint(
            "duration_seconds IS NULL OR duration_seconds >= 0",
            name="concept_text_audios_duration_non_negative_check",
        ),
        db.CheckConstraint(
            "file_size_bytes IS NULL OR file_size_bytes >= 0",
            name="concept_text_audios_file_size_non_negative_check",
        ),
    )
