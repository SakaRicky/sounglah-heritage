"""add concept text audio history

Revision ID: d9e0f1a2b3c4
Revises: c3d4e5f6a7b8
Create Date: 2026-05-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "d9e0f1a2b3c4"
down_revision = "c3d4e5f6a7b8"
branch_labels = None
depends_on = None


def _table_names():
    return set(sa.inspect(op.get_bind()).get_table_names())


def _column_names(table_name):
    if table_name not in _table_names():
        return set()

    return {column["name"] for column in sa.inspect(op.get_bind()).get_columns(table_name)}


def upgrade():
    tables = _table_names()

    if "concept_text_audios" not in tables:
        op.create_table(
            "concept_text_audios",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("concept_text_id", sa.String(length=36), nullable=False),
            sa.Column("audio_url", sa.String(length=500), nullable=False),
            sa.Column("audio_public_id", sa.String(length=255), nullable=True),
            sa.Column("storage_provider", sa.String(length=50), nullable=False),
            sa.Column("duration_seconds", sa.Integer(), nullable=True),
            sa.Column("file_size_bytes", sa.Integer(), nullable=True),
            sa.Column("mime_type", sa.String(length=120), nullable=True),
            sa.Column("status", sa.String(length=30), nullable=False),
            sa.Column("recorded_by_user_id", sa.Integer(), nullable=True),
            sa.Column("reviewed_by_user_id", sa.Integer(), nullable=True),
            sa.Column("review_note", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("rejected_at", sa.DateTime(timezone=True), nullable=True),
            sa.CheckConstraint(
                "status IN ('draft', 'pending_review', 'approved', 'rejected', 'archived')",
                name="concept_text_audios_status_check",
            ),
            sa.CheckConstraint(
                "length(trim(audio_url)) > 0",
                name="concept_text_audios_audio_url_not_empty_check",
            ),
            sa.CheckConstraint(
                "duration_seconds IS NULL OR duration_seconds >= 0",
                name="concept_text_audios_duration_non_negative_check",
            ),
            sa.CheckConstraint(
                "file_size_bytes IS NULL OR file_size_bytes >= 0",
                name="concept_text_audios_file_size_non_negative_check",
            ),
            sa.ForeignKeyConstraint(["concept_text_id"], ["concept_texts.id"]),
            sa.ForeignKeyConstraint(["recorded_by_user_id"], ["users.id"]),
            sa.ForeignKeyConstraint(["reviewed_by_user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(
            "ix_concept_text_audios_concept_text_id",
            "concept_text_audios",
            ["concept_text_id"],
        )
        op.create_index("ix_concept_text_audios_status", "concept_text_audios", ["status"])

    concept_text_columns = _column_names("concept_texts")
    if "concept_texts" in _table_names() and "current_audio_id" not in concept_text_columns:
        op.add_column(
            "concept_texts",
            sa.Column("current_audio_id", sa.String(length=36), nullable=True),
        )
        op.create_index("ix_concept_texts_current_audio_id", "concept_texts", ["current_audio_id"])
        with op.batch_alter_table("concept_texts") as batch_op:
            batch_op.create_foreign_key(
                "fk_concept_texts_current_audio_id_concept_text_audios",
                "concept_text_audios",
                ["current_audio_id"],
                ["id"],
            )


def downgrade():
    concept_text_columns = _column_names("concept_texts")
    if "current_audio_id" in concept_text_columns:
        with op.batch_alter_table("concept_texts") as batch_op:
            batch_op.drop_constraint(
                "fk_concept_texts_current_audio_id_concept_text_audios",
                type_="foreignkey",
            )
        op.drop_index("ix_concept_texts_current_audio_id", table_name="concept_texts")
        op.drop_column("concept_texts", "current_audio_id")

    if "concept_text_audios" in _table_names():
        op.drop_index("ix_concept_text_audios_status", table_name="concept_text_audios")
        op.drop_index("ix_concept_text_audios_concept_text_id", table_name="concept_text_audios")
        op.drop_table("concept_text_audios")
