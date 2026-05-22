from datetime import datetime, timezone
from uuid import uuid4

from app.extensions import db


class Concept(db.Model):
    __tablename__ = "concepts"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    key = db.Column(db.String(120), nullable=False, unique=True, index=True)
    slug = db.Column(db.String(160), nullable=False, unique=True, index=True)
    title = db.Column(db.String(160), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(120), nullable=True)
    default_image_url = db.Column(db.String(500), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    image_public_id = db.Column(db.String(255), nullable=True)
    image_alt_text = db.Column(db.String(255), nullable=True)
    difficulty_level = db.Column(db.String(30), nullable=False, default="beginner")
    status = db.Column(db.String(30), nullable=False, default="active")
    published_at = db.Column(db.DateTime(timezone=True), nullable=True)
    sort_order = db.Column(db.Integer, nullable=False, default=0)
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

    __table_args__ = (
        db.CheckConstraint(
            "difficulty_level IN ('beginner', 'intermediate', 'advanced')",
            name="concepts_difficulty_level_check",
        ),
        db.CheckConstraint("status IN ('active', 'disabled')", name="concepts_status_check"),
        db.CheckConstraint("length(trim(title)) > 0", name="concepts_title_not_empty_check"),
    )
