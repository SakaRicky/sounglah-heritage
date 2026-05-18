"""initial schema

Revision ID: 7061b43c586f
Revises: 
Create Date: 2026-05-18 12:00:34.158376

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7061b43c586f'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "users" not in tables:
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("password_hash", sa.String(length=255), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("email"),
        )
        op.create_index("ix_users_email", "users", ["email"], unique=True)

    if "languages" not in tables:
        op.create_table(
            "languages",
            sa.Column("id", sa.String(length=36), nullable=False),
            sa.Column("name", sa.String(length=120), nullable=False),
            sa.Column("native_name", sa.String(length=120), nullable=True),
            sa.Column("code", sa.String(length=50), nullable=False),
            sa.Column("slug", sa.String(length=140), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("direction", sa.String(length=10), nullable=False),
            sa.Column("status", sa.String(length=20), nullable=False),
            sa.Column("sort_order", sa.Integer(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
            sa.CheckConstraint(
                "direction IN ('ltr', 'rtl')",
                name="languages_direction_check",
            ),
            sa.CheckConstraint(
                "length(trim(name)) > 0",
                name="languages_name_not_empty_check",
            ),
            sa.CheckConstraint(
                "status IN ('active', 'disabled')",
                name="languages_status_check",
            ),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("code"),
            sa.UniqueConstraint("slug"),
        )
        op.create_index("ix_languages_code", "languages", ["code"], unique=True)
        op.create_index("ix_languages_slug", "languages", ["slug"], unique=True)


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "languages" in tables:
        op.drop_index("ix_languages_slug", table_name="languages")
        op.drop_index("ix_languages_code", table_name="languages")
        op.drop_table("languages")

    if "users" in tables:
        op.drop_index("ix_users_email", table_name="users")
        op.drop_table("users")
