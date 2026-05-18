"""add concepts table

Revision ID: 9c8f1a2b3d4e
Revises: 7061b43c586f
Create Date: 2026-05-18 13:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "9c8f1a2b3d4e"
down_revision = "7061b43c586f"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "concepts" not in tables:
        op.create_table(
            "concepts",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("key", sa.String(length=120), nullable=False),
            sa.Column("slug", sa.String(length=160), nullable=False),
            sa.Column("title", sa.String(length=160), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("category", sa.String(length=120), nullable=True),
            sa.Column("difficulty_level", sa.String(length=30), nullable=False),
            sa.Column("status", sa.String(length=30), nullable=False),
            sa.Column("sort_order", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.CheckConstraint(
                "difficulty_level IN ('beginner', 'intermediate', 'advanced')",
                name="concepts_difficulty_level_check",
            ),
            sa.CheckConstraint(
                "length(trim(title)) > 0",
                name="concepts_title_not_empty_check",
            ),
            sa.CheckConstraint(
                "status IN ('active', 'disabled')",
                name="concepts_status_check",
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("key"),
            sa.UniqueConstraint("slug"),
        )
        op.create_index("ix_concepts_key", "concepts", ["key"], unique=True)
        op.create_index("ix_concepts_slug", "concepts", ["slug"], unique=True)


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "concepts" in tables:
        op.drop_index("ix_concepts_slug", table_name="concepts")
        op.drop_index("ix_concepts_key", table_name="concepts")
        op.drop_table("concepts")
