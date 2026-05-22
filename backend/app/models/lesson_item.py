from datetime import datetime, timezone
from uuid import uuid4

from app.extensions import db


CONCEPT_BACKED_ITEM_TYPES = frozenset({"VOCABULARY", "PHRASE", "AUDIO_LISTEN"})
LESSON_ITEM_TYPES = frozenset({"VOCABULARY", "PHRASE", "AUDIO_LISTEN", "CULTURAL_NOTE"})


def validate_lesson_item_concept_id(item_type, concept_id):
    errors = {}
    if item_type in CONCEPT_BACKED_ITEM_TYPES and not concept_id:
        errors["conceptId"] = "Concept is required for this item type."
    return errors


def validate_cultural_note_content_json(item_type, content_json):
    """Validate CULTURAL_NOTE content_json; intended for API layer use."""
    errors = {}
    if item_type != "CULTURAL_NOTE":
        return errors

    content = content_json or {}
    if not str(content.get("noteTextEn") or "").strip():
        errors["contentJson.noteTextEn"] = "English note text is required."
    if not str(content.get("noteTextFr") or "").strip():
        errors["contentJson.noteTextFr"] = "French note text is required."
    return errors


class LessonItem(db.Model):
    __tablename__ = "lesson_items"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    lesson_id = db.Column(
        db.String(36),
        db.ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type = db.Column(db.String(30), nullable=False)
    concept_id = db.Column(
        db.String(36),
        db.ForeignKey("concepts.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    title = db.Column(db.String(160), nullable=False)
    instruction_text = db.Column(db.Text, nullable=True)
    content_json = db.Column(db.JSON, nullable=False, default=dict)
    order_index = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
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

    lesson = db.relationship("Lesson", back_populates="items")
    concept = db.relationship("Concept", backref=db.backref("lesson_items", lazy="dynamic"))

    __table_args__ = (
        db.UniqueConstraint("lesson_id", "order_index", name="uq_lesson_items_lesson_order"),
        db.CheckConstraint("length(trim(title)) > 0", name="lesson_items_title_not_empty_check"),
        db.CheckConstraint(
            "type IN ('VOCABULARY', 'PHRASE', 'AUDIO_LISTEN', 'CULTURAL_NOTE')",
            name="lesson_items_type_check",
        ),
    )
