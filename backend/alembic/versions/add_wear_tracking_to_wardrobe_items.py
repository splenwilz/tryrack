"""add_wear_tracking_to_wardrobe_items

Revision ID: add_wear_tracking
Revises: ec4b5a374fc1
Create Date: 2025-01-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_wear_tracking'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Add wear tracking fields to wardrobe_items."""
    # Add last_worn_at timestamp (nullable, timezone-aware)
    op.add_column('wardrobe_items', sa.Column('last_worn_at', sa.DateTime(timezone=True), nullable=True))
    
    # Add wear_count integer (default 0)
    op.add_column('wardrobe_items', sa.Column('wear_count', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    """Downgrade schema - Remove wear tracking fields."""
    op.drop_column('wardrobe_items', 'wear_count')
    op.drop_column('wardrobe_items', 'last_worn_at')

