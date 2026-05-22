from datetime import datetime, timezone
from uuid import uuid4

from app.extensions import db


class Lesson(db.Model):
    __tablename__ = "lessons"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    title = db.Column(db.String(160), nullable=False)
    slug = db.Column(db.String(160), nullable=False, unique=True, index=True)
    description = db.Column(db.Text, nullable=True)
    difficulty = db.Column(db.String(30), nullable=False, default="beginner")
    estimated_minutes = db.Column(db.Integer, nullable=True)
    cover_image_url = db.Column(db.String(500), nullable=True)
    cover_image_public_id = db.Column(db.String(255), nullable=True)
    cover_image_alt_text = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(30), nullable=False, default="draft")
    order_index = db.Column(db.Integer, nullable=False, default=0)
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

    items = db.relationship(
        "LessonItem",
        back_populates="lesson",
        cascade="all, delete-orphan",
        order_by="LessonItem.order_index",
    )

    __table_args__ = (
        db.CheckConstraint(
            "difficulty IN ('beginner', 'intermediate', 'advanced')",
            name="lessons_difficulty_check",
        ),
        db.CheckConstraint(
            "status IN ('draft', 'published', 'archived')",
            name="lessons_status_check",
        ),
        db.CheckConstraint("length(trim(title)) > 0", name="lessons_title_not_empty_check"),
    )
