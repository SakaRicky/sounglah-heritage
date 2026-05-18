from datetime import datetime, timezone
from uuid import uuid4

from app.extensions import db


class Language(db.Model):
    __tablename__ = "languages"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(120), nullable=False)
    native_name = db.Column(db.String(120), nullable=True)
    code = db.Column(db.String(50), nullable=False, unique=True, index=True)
    slug = db.Column(db.String(140), nullable=False, unique=True, index=True)
    description = db.Column(db.Text, nullable=True)
    direction = db.Column(db.String(10), nullable=False, default="ltr")
    status = db.Column(db.String(20), nullable=False, default="active")
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
        db.CheckConstraint("direction IN ('ltr', 'rtl')", name="languages_direction_check"),
        db.CheckConstraint("status IN ('active', 'disabled')", name="languages_status_check"),
        db.CheckConstraint("length(trim(name)) > 0", name="languages_name_not_empty_check"),
    )
