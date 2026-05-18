"""add concept texts table

Revision ID: a4f2d7c9e013
Revises: 9c8f1a2b3d4e
Create Date: 2026-05-18 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "a4f2d7c9e013"
down_revision = "9c8f1a2b3d4e"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "concept_texts" not in tables:
        op.create_table(
            "concept_texts",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("concept_id", sa.String(length=36), nullable=False),
            sa.Column("language_id", sa.String(length=36), nullable=False),
            sa.Column("text", sa.Text(), nullable=False),
            sa.Column("pronunciation", sa.String(length=255), nullable=True),
            sa.Column("literal_meaning", sa.Text(), nullable=True),
            sa.Column("usage_note", sa.Text(), nullable=True),
            sa.Column("status", sa.String(length=30), nullable=False),
            sa.Column("review_status", sa.String(length=30), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.CheckConstraint(
                "length(trim(text)) > 0",
                name="concept_texts_text_not_empty_check",
            ),
            sa.CheckConstraint(
                "status IN ('active', 'disabled')",
                name="concept_texts_status_check",
            ),
            sa.CheckConstraint(
                "review_status IN ('draft', 'needs_review', 'approved')",
                name="concept_texts_review_status_check",
            ),
            sa.ForeignKeyConstraint(["concept_id"], ["concepts.id"]),
            sa.ForeignKeyConstraint(["language_id"], ["languages.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "concept_id",
                "language_id",
                name="uq_concept_texts_concept_language",
            ),
        )
        op.create_index("ix_concept_texts_concept_id", "concept_texts", ["concept_id"])
        op.create_index("ix_concept_texts_language_id", "concept_texts", ["language_id"])


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "concept_texts" in tables:
        op.drop_index("ix_concept_texts_language_id", table_name="concept_texts")
        op.drop_index("ix_concept_texts_concept_id", table_name="concept_texts")
        op.drop_table("concept_texts")
