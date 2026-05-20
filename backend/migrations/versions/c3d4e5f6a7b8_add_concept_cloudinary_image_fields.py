"""add concept cloudinary image fields

Revision ID: c3d4e5f6a7b8
Revises: b7c2a9d8e5f1
Create Date: 2026-05-20 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "c3d4e5f6a7b8"
down_revision = "b7c2a9d8e5f1"
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
    if not concept_columns:
        return

    if "image_url" not in concept_columns:
        op.add_column("concepts", sa.Column("image_url", sa.String(length=500), nullable=True))
    if "image_public_id" not in concept_columns:
        op.add_column("concepts", sa.Column("image_public_id", sa.String(length=255), nullable=True))
    if "image_alt_text" not in concept_columns:
        op.add_column("concepts", sa.Column("image_alt_text", sa.String(length=255), nullable=True))


def downgrade():
    concept_columns = _column_names("concepts")
    if "image_alt_text" in concept_columns:
        op.drop_column("concepts", "image_alt_text")
    if "image_public_id" in concept_columns:
        op.drop_column("concepts", "image_public_id")
    if "image_url" in concept_columns:
        op.drop_column("concepts", "image_url")
