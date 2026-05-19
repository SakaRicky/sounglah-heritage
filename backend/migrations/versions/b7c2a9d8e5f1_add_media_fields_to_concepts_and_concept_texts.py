"""add media fields to concepts and concept texts

Revision ID: b7c2a9d8e5f1
Revises: a4f2d7c9e013
Create Date: 2026-05-18 14:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "b7c2a9d8e5f1"
down_revision = "a4f2d7c9e013"
branch_labels = None
depends_on = None


def _column_names(table_name):
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if table_name not in set(inspector.get_table_names()):
        return set()

    return {column["name"] for column in inspector.get_columns(table_name)}


def upgrade():
    concept_columns = _column_names("concepts")
    if "concepts" in set(sa.inspect(op.get_bind()).get_table_names()):
        if "default_image_url" not in concept_columns:
            op.add_column(
                "concepts",
                sa.Column("default_image_url", sa.String(length=500), nullable=True),
            )

    concept_text_columns = _column_names("concept_texts")
    if "concept_texts" in set(sa.inspect(op.get_bind()).get_table_names()):
        if "audio_url" not in concept_text_columns:
            op.add_column(
                "concept_texts",
                sa.Column("audio_url", sa.String(length=500), nullable=True),
            )
        if "pronunciation_note" not in concept_text_columns:
            op.add_column(
                "concept_texts",
                sa.Column("pronunciation_note", sa.Text(), nullable=True),
            )


def downgrade():
    concept_text_columns = _column_names("concept_texts")
    if "pronunciation_note" in concept_text_columns:
        op.drop_column("concept_texts", "pronunciation_note")
    if "audio_url" in concept_text_columns:
        op.drop_column("concept_texts", "audio_url")

    concept_columns = _column_names("concepts")
    if "default_image_url" in concept_columns:
        op.drop_column("concepts", "default_image_url")
