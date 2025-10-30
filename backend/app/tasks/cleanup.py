"""
Background cleanup tasks for orphaned processing items.
"""
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import WardrobeItem, ProcessingStatus

logger = logging.getLogger(__name__)

async def cleanup_old_processing_items(db: Session, hours_old: int = 1):
    """
    Remove orphaned processing items older than specified hours.
    
    These items are created temporarily during AI processing.
    If they're still in 'processing' status after 1 hour,
    something went wrong and they should be deleted.
    
    Args:
        db: Database session
        hours_old: Delete items older than this many hours (default: 1)
    """
    try:
        cutoff_time = datetime.utcnow() - timedelta(hours=hours_old)
        
        # Find old processing items by processing_status, not category
        old_items = db.query(WardrobeItem).filter(
            WardrobeItem.processing_status == ProcessingStatus.PROCESSING,
            WardrobeItem.created_at < cutoff_time
        ).all()
        
        if not old_items:
            logger.info("✅ No orphaned processing items found")
            return 0
        
        count = len(old_items)
        logger.warning(f"🗑️ Found {count} orphaned processing items older than {hours_old}h")
        
        # Delete them
        for item in old_items:
            logger.info(f"🗑️ Deleting orphaned item: ID {item.id}, title '{item.title}', created {item.created_at}")
            db.delete(item)
        
        db.commit()
        logger.info(f"✅ Cleaned up {count} orphaned processing items")
        return count
        
    except Exception as e:
        logger.error(f"❌ Error cleaning up processing items: {e}")
        db.rollback()
        raise

