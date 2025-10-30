"""add_wardrobe_items_table_fixed

Revision ID: 1271f37b8fb9
Revises: 1d131bb7ebe2
Create Date: 2025-10-27 22:41:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '1271f37b8fb9'
down_revision: Union[str, Sequence[str], None] = '1d131bb7ebe2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create ItemStatus enum type
    op.execute("CREATE TYPE itemstatus AS ENUM ('CLEAN', 'WORN', 'DIRTY')")
    
    # Create wardrobe_items table
    op.create_table(
        'wardrobe_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('colors', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('sizes', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('tags', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('image_original', sa.String(length=500), nullable=True),
        sa.Column('image_clean', sa.String(length=500), nullable=True),
        sa.Column('status', postgresql.ENUM('CLEAN', 'WORN', 'DIRTY', name='itemstatus', create_type=False), nullable=False, server_default='CLEAN'),
        sa.Column('formality', sa.Float(), nullable=True),
        sa.Column('season', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('price', sa.Float(), nullable=True),
        sa.Column('embedding_id', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index(op.f('ix_wardrobe_items_id'), 'wardrobe_items', ['id'], unique=False)
    op.create_index(op.f('ix_wardrobe_items_user_id'), 'wardrobe_items', ['user_id'], unique=False)
    op.create_index(op.f('ix_wardrobe_items_category'), 'wardrobe_items', ['category'], unique=False)
    op.create_index(op.f('ix_wardrobe_items_status'), 'wardrobe_items', ['status'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_wardrobe_items_status'), table_name='wardrobe_items')
    op.drop_index(op.f('ix_wardrobe_items_category'), table_name='wardrobe_items')
    op.drop_index(op.f('ix_wardrobe_items_user_id'), table_name='wardrobe_items')
    op.drop_index(op.f('ix_wardrobe_items_id'), table_name='wardrobe_items')
    
    # Drop table
    op.drop_table('wardrobe_items')
    
    # Drop enum type
    op.execute('DROP TYPE itemstatus')
