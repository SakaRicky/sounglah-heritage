"""add required language flag

Revision ID: e1f2a3b4c5d6
Revises: d9e0f1a2b3c4
Create Date: 2026-05-22 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "e1f2a3b4c5d6"
down_revision = "d9e0f1a2b3c4"
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("languages")}

    if "is_required_for_concept_completion" not in columns:
        op.add_column(
            "languages",
            sa.Column(
                "is_required_for_concept_completion",
                sa.Boolean(),
                nullable=False,
                server_default=sa.false(),
            ),
        )

    op.execute(
        sa.text(
            """
            UPDATE languages
            SET is_required_for_concept_completion = 1
            WHERE code IN ('en', 'fr', 'med')
            """
        )
    )


def downgrade():
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns("languages")}

    if "is_required_for_concept_completion" in columns:
        op.drop_column("languages", "is_required_for_concept_completion")
