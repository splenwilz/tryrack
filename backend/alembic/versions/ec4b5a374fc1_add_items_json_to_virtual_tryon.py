"""add_items_json_to_virtual_tryon

Revision ID: ec4b5a374fc1
Revises: 9f2b1c0f1add
Create Date: 2025-10-31 08:33:00.333220

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'ec4b5a374fc1'
down_revision: Union[str, Sequence[str], None] = '9f2b1c0f1add'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add items JSON column to virtual_tryon_results for multi-item try-on support.
    
    This column stores an array of item objects:
    [{"item_id": "123", "item_type": "wardrobe", "category": "top", "colors": ["blue"]}, ...]
    
    Nullable for backward compatibility with existing single-item records.
    """
    # Only add the items column - other detected changes are existing schema differences
    op.add_column('virtual_tryon_results', sa.Column('items', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Remove items JSON column from virtual_tryon_results."""
    op.drop_column('virtual_tryon_results', 'items')
