"""add concept published at

Revision ID: a1b2c3d4e5f6
Revises: f2a3b4c5d6e7
Create Date: 2026-05-22 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "a1b2c3d4e5f6"
down_revision = "f2a3b4c5d6e7"
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
    if "published_at" not in concept_columns:
        op.add_column("concepts", sa.Column("published_at", sa.DateTime(timezone=True), nullable=True))


def downgrade():
    concept_columns = _column_names("concepts")
    if "published_at" in concept_columns:
        op.drop_column("concepts", "published_at")
