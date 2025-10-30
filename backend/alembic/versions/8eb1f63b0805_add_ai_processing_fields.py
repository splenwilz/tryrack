"""add_ai_processing_fields

Revision ID: 8eb1f63b0805
Revises: 1271f37b8fb9
Create Date: 2025-10-29 08:00:24.853555

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '8eb1f63b0805'
down_revision: Union[str, Sequence[str], None] = '1271f37b8fb9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Add AI processing fields only."""
    # 🤖 Add AI processing status enum and columns
    op.execute("CREATE TYPE processingstatus AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')")
    op.add_column('wardrobe_items', sa.Column('processing_status', sa.Enum('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', name='processingstatus'), server_default='PENDING', nullable=False))
    op.add_column('wardrobe_items', sa.Column('ai_suggestions', sa.JSON(), nullable=True))
    op.create_index(op.f('ix_wardrobe_items_processing_status'), 'wardrobe_items', ['processing_status'], unique=False)


def downgrade() -> None:
    """Downgrade schema - Remove AI processing fields."""
    op.drop_index(op.f('ix_wardrobe_items_processing_status'), table_name='wardrobe_items')
    op.drop_column('wardrobe_items', 'ai_suggestions')
    op.drop_column('wardrobe_items', 'processing_status')
    op.execute("DROP TYPE processingstatus")
