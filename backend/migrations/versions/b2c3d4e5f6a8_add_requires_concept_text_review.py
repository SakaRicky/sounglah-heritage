"""add requires concept text review flag

Revision ID: b2c3d4e5f6a8
Revises: a1b2c3d4e5f6
Create Date: 2026-05-22 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "b2c3d4e5f6a8"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("languages")}

    if "requires_concept_text_review" not in columns:
        op.add_column(
            "languages",
            sa.Column(
                "requires_concept_text_review",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
        )

    op.execute(
        sa.text(
            """
            UPDATE languages
            SET requires_concept_text_review = true
            WHERE code IN ('med', 'medumba')
            """
        )
    )


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("languages")}

    if "requires_concept_text_review" in columns:
        op.drop_column("languages", "requires_concept_text_review")
