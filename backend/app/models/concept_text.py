from datetime import datetime, timezone
from uuid import uuid4

from app.extensions import db


class ConceptText(db.Model):
    __tablename__ = "concept_texts"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    concept_id = db.Column(
        db.String(36),
        db.ForeignKey("concepts.id"),
        nullable=False,
        index=True,
    )
    language_id = db.Column(
        db.String(36),
        db.ForeignKey("languages.id"),
        nullable=False,
        index=True,
    )
    text = db.Column(db.Text, nullable=False)
    pronunciation = db.Column(db.String(255), nullable=True)
    literal_meaning = db.Column(db.Text, nullable=True)
    usage_note = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(30), nullable=False, default="active")
    review_status = db.Column(db.String(30), nullable=False, default="draft")
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

    concept = db.relationship("Concept", backref=db.backref("concept_texts", lazy="dynamic"))
    language = db.relationship("Language", backref=db.backref("concept_texts", lazy="dynamic"))

    __table_args__ = (
        db.UniqueConstraint("concept_id", "language_id", name="uq_concept_texts_concept_language"),
        db.CheckConstraint("length(trim(text)) > 0", name="concept_texts_text_not_empty_check"),
        db.CheckConstraint(
            "status IN ('active', 'disabled')",
            name="concept_texts_status_check",
        ),
        db.CheckConstraint(
            "review_status IN ('draft', 'needs_review', 'approved')",
            name="concept_texts_review_status_check",
        ),
    )
