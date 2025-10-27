"""Add profile completion fields to User model

Revision ID: add_profile_completion
Revises: 5e3c09959dff
Create Date: 2024-01-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_profile_completion'
down_revision: Union[str, Sequence[str], None] = '5e3c09959dff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add profile completion boolean
    op.add_column('users', sa.Column('profile_completed', sa.Boolean(), nullable=False, server_default='false'))
    
    # Add profile fields
    op.add_column('users', sa.Column('gender', sa.String(length=10), nullable=True))
    op.add_column('users', sa.Column('height', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('weight', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('shoe_size', sa.String(length=10), nullable=True))
    op.add_column('users', sa.Column('top_size', sa.String(length=10), nullable=True))
    op.add_column('users', sa.Column('dress_size', sa.String(length=10), nullable=True))
    op.add_column('users', sa.Column('pants_size', sa.String(length=10), nullable=True))
    op.add_column('users', sa.Column('full_body_image_url', sa.String(length=500), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'full_body_image_url')
    op.drop_column('users', 'pants_size')
    op.drop_column('users', 'dress_size')
    op.drop_column('users', 'top_size')
    op.drop_column('users', 'shoe_size')
    op.drop_column('users', 'weight')
    op.drop_column('users', 'height')
    op.drop_column('users', 'gender')
    op.drop_column('users', 'profile_completed')

