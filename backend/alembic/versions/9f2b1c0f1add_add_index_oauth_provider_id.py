"""add index on users.oauth_provider_id

Revision ID: 9f2b1c0f1add
Revises: 820c43211db3
Create Date: 2025-10-31 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9f2b1c0f1add'
down_revision = '820c43211db3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index('ix_users_oauth_provider_id', 'users', ['oauth_provider_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_users_oauth_provider_id', table_name='users')


