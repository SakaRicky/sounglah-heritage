"""add rejected concept text review status

Revision ID: f2a3b4c5d6e7
Revises: e1f2a3b4c5d6
Create Date: 2026-05-22 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = "f2a3b4c5d6e7"
down_revision = "e1f2a3b4c5d6"
branch_labels = None
depends_on = None


OLD_REVIEW_STATUS_CHECK = "review_status IN ('draft', 'needs_review', 'approved')"
NEW_REVIEW_STATUS_CHECK = "review_status IN ('draft', 'needs_review', 'approved', 'rejected')"


def _table_names():
    return set(sa.inspect(op.get_bind()).get_table_names())


def upgrade():
    if "concept_texts" not in _table_names():
        return

    with op.batch_alter_table("concept_texts") as batch_op:
        batch_op.drop_constraint("concept_texts_review_status_check", type_="check")
        batch_op.create_check_constraint(
            "concept_texts_review_status_check",
            NEW_REVIEW_STATUS_CHECK,
        )


def downgrade():
    if "concept_texts" not in _table_names():
        return

    op.execute(
        sa.text(
            """
            UPDATE concept_texts
            SET review_status = 'needs_review'
            WHERE review_status = 'rejected'
            """
        )
    )

    with op.batch_alter_table("concept_texts") as batch_op:
        batch_op.drop_constraint("concept_texts_review_status_check", type_="check")
        batch_op.create_check_constraint(
            "concept_texts_review_status_check",
            OLD_REVIEW_STATUS_CHECK,
        )
