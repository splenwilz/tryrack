"""add_user_type_to_users

Revision ID: c9baaa39c4cd
Revises: 1b2b687ec81e
Create Date: 2025-10-26 23:04:43.796622

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9baaa39c4cd'
down_revision: Union[str, Sequence[str], None] = '1b2b687ec81e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create the ENUM type first
    op.execute("CREATE TYPE usertype AS ENUM ('individual', 'boutique')")
    # Add the column using the ENUM
    op.add_column('users', sa.Column('user_type', sa.Enum('individual', 'boutique', name='usertype', native_enum=False), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # Drop the column first
    op.drop_column('users', 'user_type')
    # Drop the ENUM type
    op.execute("DROP TYPE usertype")
