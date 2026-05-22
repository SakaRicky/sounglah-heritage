"""add lessons and lesson_items tables

Revision ID: c4d5e6f7a8b9
Revises: b2c3d4e5f6a8
Create Date: 2026-05-22 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "c4d5e6f7a8b9"
down_revision = "b2c3d4e5f6a8"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "lessons" not in tables:
        op.create_table(
            "lessons",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("title", sa.String(length=160), nullable=False),
            sa.Column("slug", sa.String(length=160), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("difficulty", sa.String(length=30), nullable=False),
            sa.Column("estimated_minutes", sa.Integer(), nullable=True),
            sa.Column("cover_image_url", sa.String(length=500), nullable=True),
            sa.Column("cover_image_public_id", sa.String(length=255), nullable=True),
            sa.Column("cover_image_alt_text", sa.String(length=255), nullable=True),
            sa.Column("status", sa.String(length=30), nullable=False),
            sa.Column("order_index", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.CheckConstraint(
                "difficulty IN ('beginner', 'intermediate', 'advanced')",
                name="lessons_difficulty_check",
            ),
            sa.CheckConstraint(
                "status IN ('draft', 'published', 'archived')",
                name="lessons_status_check",
            ),
            sa.CheckConstraint(
                "length(trim(title)) > 0",
                name="lessons_title_not_empty_check",
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("slug"),
        )
        op.create_index("ix_lessons_slug", "lessons", ["slug"], unique=True)

    if "lesson_items" not in tables:
        op.create_table(
            "lesson_items",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("lesson_id", sa.String(length=36), nullable=False),
            sa.Column("type", sa.String(length=30), nullable=False),
            sa.Column("concept_id", sa.String(length=36), nullable=True),
            sa.Column("title", sa.String(length=160), nullable=False),
            sa.Column("instruction_text", sa.Text(), nullable=True),
            sa.Column("content_json", sa.JSON(), nullable=False),
            sa.Column("order_index", sa.Integer(), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.CheckConstraint(
                "length(trim(title)) > 0",
                name="lesson_items_title_not_empty_check",
            ),
            sa.CheckConstraint(
                "type IN ('VOCABULARY', 'PHRASE', 'AUDIO_LISTEN', 'CULTURAL_NOTE')",
                name="lesson_items_type_check",
            ),
            sa.ForeignKeyConstraint(["concept_id"], ["concepts.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "lesson_id",
                "order_index",
                name="uq_lesson_items_lesson_order",
            ),
        )
        op.create_index("ix_lesson_items_concept_id", "lesson_items", ["concept_id"])
        op.create_index("ix_lesson_items_lesson_id", "lesson_items", ["lesson_id"])


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "lesson_items" in tables:
        op.drop_index("ix_lesson_items_lesson_id", table_name="lesson_items")
        op.drop_index("ix_lesson_items_concept_id", table_name="lesson_items")
        op.drop_table("lesson_items")

    if "lessons" in tables:
        op.drop_index("ix_lessons_slug", table_name="lessons")
        op.drop_table("lessons")
