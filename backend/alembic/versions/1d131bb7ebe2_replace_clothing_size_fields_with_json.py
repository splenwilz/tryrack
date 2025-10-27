"""replace_clothing_size_fields_with_json

Revision ID: 1d131bb7ebe2
Revises: c9baaa39c4cd
Create Date: 2025-10-27 09:39:20.715766

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1d131bb7ebe2'
down_revision: Union[str, Sequence[str], None] = 'c9baaa39c4cd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add new clothing_sizes column
    op.add_column('users', sa.Column('clothing_sizes', sa.JSON(), nullable=True))
    
    # Drop old size columns
    op.drop_column('users', 'dress_size')
    op.drop_column('users', 'pants_size')
    op.drop_column('users', 'shoe_size')
    op.drop_column('users', 'top_size')


def downgrade() -> None:
    """Downgrade schema."""
    # Re-add old size columns
    op.add_column('users', sa.Column('top_size', sa.VARCHAR(length=10), autoincrement=False, nullable=True))
    op.add_column('users', sa.Column('shoe_size', sa.VARCHAR(length=10), autoincrement=False, nullable=True))
    op.add_column('users', sa.Column('pants_size', sa.VARCHAR(length=10), autoincrement=False, nullable=True))
    op.add_column('users', sa.Column('dress_size', sa.VARCHAR(length=10), autoincrement=False, nullable=True))
    
    # Drop new column
    op.drop_column('users', 'clothing_sizes')
