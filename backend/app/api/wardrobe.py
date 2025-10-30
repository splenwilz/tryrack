from fastapi import APIRouter, Depends, HTTPException, status, Header, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import time
from starlette.concurrency import run_in_threadpool

from app.db import get_db
from app.models import WardrobeItem, ProcessingStatus
from app.schemas import WardrobeItemResponse, WardrobeItemCreate, WardrobeItemUpdate, WardrobeItemStatusUpdate
from app.services import (
    get_wardrobe_items,
    get_wardrobe_item,
    create_wardrobe_item,
    update_wardrobe_item,
    update_wardrobe_item_status,
    delete_wardrobe_item,
    get_user,
)
from app.core.config import settings
from app.services.s3_service import upload_file_from_base64
from app.services.gemini_service import remove_background, extract_item_metadata

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/wardrobe", tags=["wardrobe"])


def parse_mime_and_ext(data_url: str) -> tuple[str, str]:
    """Extract MIME type and file extension from data URL."""
    parts = data_url.split(',')
    if len(parts) != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid data URL format"
        )
    
    header = parts[0]
    mime = header.split(';')[0].split(':')[1] if ':' in header else None
    
    # Map MIME type to extension
    ext_map = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/heic': 'jpg',  # normalize HEIC to JPG
        'image/heif': 'jpg',  # normalize HEIF to JPG
    }
    ext = ext_map.get(mime or '', 'jpg')
    
    # Normalize unknown MIME types to JPEG for consistency
    if not mime or mime not in ext_map:
        # Normalize unknowns to JPEG to avoid Content-Type mismatches
        return 'image/jpeg', 'jpg'
    
    return mime, ext


def get_current_user_id_for_testing(
    user_id: int = Query(1, description="Test user ID for development")
):
    """
    Get current user ID - for testing without auth.
    
    ⚠️ DEV-ONLY: This function is a security risk in production!
    It allows any caller to access any user's data by changing the user_id parameter.
    Replace with proper JWT authentication before deploying to production.
    """
    # Guard to prevent accidental production exposure
    if settings.ENVIRONMENT.lower() not in ("dev", "development", "local"):
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Auth required in production"
        )
    
    return user_id


def serialize_wardrobe_items(items: List[WardrobeItem]) -> List[dict]:
    """Serialize wardrobe items with lowercase status and AI fields."""
    result = []
    for item in items:
        item_dict = {
            'id': item.id,
            'user_id': item.user_id,
            'title': item.title,
            'description': item.description,
            'category': item.category,
            'colors': item.colors,
            'sizes': item.sizes,
            'tags': item.tags,
            'price': item.price,
            'formality': item.formality,
            'season': item.season,
            'image_original': item.image_original,
            'image_clean': item.image_clean,
            'status': item.status.value.lower() if hasattr(item.status, 'value') else str(item.status).lower(),
            'processing_status': item.processing_status.value.lower() if hasattr(item.processing_status, 'value') else str(item.processing_status).lower(),  # 🤖
            'ai_suggestions': item.ai_suggestions,  # 🤖
            'created_at': item.created_at,
            'updated_at': item.updated_at,
        }
        result.append(item_dict)
    return result


@router.get("/")
def list_wardrobe_items(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id_for_testing)
):
    """
    Get all wardrobe items for the current user.
    
    Parameters:
    - skip: Number of items to skip (for pagination)
    - limit: Maximum number of items to return
    - category: Filter by category (top, bottom, shoes, dress, outerwear, accessories, underwear)
    - status: Filter by status (clean, worn, dirty)
    - user_id: Test user ID (default: 1)
    """
    items = get_wardrobe_items(db, user_id, skip=skip, limit=limit, category=category, status=status)
    return serialize_wardrobe_items(items)


def serialize_wardrobe_item(item: WardrobeItem) -> dict:
    """Serialize a single wardrobe item with lowercase status and AI fields."""
    return {
        'id': item.id,
        'user_id': item.user_id,
        'title': item.title,
        'description': item.description,
        'category': item.category,
        'colors': item.colors,
        'sizes': item.sizes,
        'tags': item.tags,
        'price': item.price,
        'formality': item.formality,
        'season': item.season,
        'image_original': item.image_original,
        'image_clean': item.image_clean,
        'status': item.status.value.lower() if hasattr(item.status, 'value') else str(item.status).lower(),
        'processing_status': item.processing_status.value.lower() if hasattr(item.processing_status, 'value') else str(item.processing_status).lower(),  # 🤖
        'ai_suggestions': item.ai_suggestions,  # 🤖
        'created_at': item.created_at,
        'updated_at': item.updated_at,
    }


@router.get("/{item_id}")
def get_wardrobe_item_by_id(
    item_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id_for_testing)
):
    """Get a specific wardrobe item by ID."""
    item = get_wardrobe_item(db, item_id, user_id)
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wardrobe item not found"
        )
    
    return serialize_wardrobe_item(item)


@router.post("/process-image", status_code=status.HTTP_200_OK)
async def process_image_endpoint(
    image_data: dict,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id_for_testing)
):
    """
    🎨 NEW: Process image immediately when user picks it (BEFORE saving to wardrobe).
    
    Flow:
    1. Receive image from frontend
    2. Upload original to S3
    3. Start AI processing in background
    4. Return processing_id immediately
    5. Frontend polls this ID for results
    
    Request body:
    {
        "image": "data:image/jpeg;base64,..."
    }
    
    Response:
    {
        "processing_id": "temp_abc123",
        "image_original": "https://s3.../original.jpg",
        "processing_status": "pending"
    }
    """
    logger.info("🎨 DEBUG: Processing image immediately")
    
    # Verify user exists
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    image_base64 = image_data.get('image')
    if not image_base64:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image provided"
        )
    
    # Don't upload original - keep in memory for AI processing
    # Only final enhanced image will be uploaded to S3
    logger.info(f"🎨 DEBUG: Image received, will process with AI (no immediate S3 upload)")
    
    try:
        timestamp = int(time.time())
        
        # Create temporary wardrobe item for processing tracking
        # This is NOT the final item - user hasn't saved yet
        from app.schemas import WardrobeItemCreate
        temp_item = WardrobeItemCreate(
            title=f'Processing_{timestamp}',  # Temporary title
            category='processing',  # Temporary category
            image_original=None,  # Will be set after AI processing
        )
        
        db_item = await run_in_threadpool(
            create_wardrobe_item,
            db,
            temp_item,
            user_id
        )
        
        logger.info(f"🎨 DEBUG: Temporary item created with ID: {db_item.id}")
        
        # Schedule background AI processing
        if settings.GEMINI_API_KEY:
            logger.info(f"🎨 DEBUG: Scheduling AI processing for item {db_item.id}")
            background_tasks.add_task(
                process_wardrobe_item_with_ai,
                item_id=db_item.id,
                user_id=user_id,
                image_base64=image_base64,
                db_session_maker=lambda: next(get_db())
            )
        else:
            logger.warning("🎨 GEMINI_API_KEY not configured, skipping AI processing")
        
        # Return processing ID for frontend to poll
        return {
            "processing_id": db_item.id,  # Frontend will poll /wardrobe/{id}
            "image_original": image_base64,  # Return original for immediate display
            "processing_status": "pending",
        }
        
    except Exception as e:
        logger.error(f"🎨 ERROR: Failed to process image: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process image: {str(e)}"
        )


async def process_wardrobe_item_with_ai(
    item_id: int,
    user_id: int,
    image_base64: str,
    db_session_maker
):
    """
    🤖 Background task to process wardrobe item with Gemini AI.
    Extracts metadata and enhances image in the background.
    """
    logger.info(f"🤖 DEBUG: Starting background AI processing for item {item_id}")
    
    # Create a new database session for this background task
    db: Session = db_session_maker()
    
    try:
        # Update status to PROCESSING
        item = db.query(WardrobeItem).filter(
            WardrobeItem.id == item_id,
            WardrobeItem.user_id == user_id
        ).first()
        
        if not item:
            logger.error(f"🤖 DEBUG: Item {item_id} not found for background processing")
            return
        
        item.processing_status = ProcessingStatus.PROCESSING
        db.commit()
        logger.info(f"🤖 DEBUG: Status updated to PROCESSING for item {item_id}")
        
        # 🚀 Run both Gemini operations in parallel for faster processing
        import asyncio
        logger.info(f"🤖 DEBUG: Starting parallel Gemini processing for item {item_id}")
        start_time = time.time()
        
        # Execute metadata extraction and image enhancement simultaneously
        metadata, cleaned_image = await asyncio.gather(
            extract_item_metadata(image_base64),
            remove_background(image_base64),
            return_exceptions=True  # Don't fail if one operation fails
        )
        
        parallel_time = time.time() - start_time
        logger.info(f"🤖 DEBUG: Parallel processing completed in {parallel_time:.2f}s")
        
        # Handle metadata result
        if isinstance(metadata, Exception):
            logger.warning(f"🤖 DEBUG: Failed to extract metadata: {metadata}")
            metadata = None
        elif metadata:
            logger.info(f"🤖 DEBUG: Metadata extracted successfully: {metadata}")
            item.ai_suggestions = metadata
            db.commit()
        else:
            logger.warning(f"🤖 DEBUG: No metadata returned")
        
        # Handle image enhancement result
        if isinstance(cleaned_image, Exception):
            logger.warning(f"🤖 DEBUG: Failed to enhance image: {cleaned_image}")
            cleaned_image = None
        
        if cleaned_image:
            logger.info(f"🤖 DEBUG: Image enhanced successfully for item {item_id}")
            # Upload enhanced image to S3 (ONLY upload - both original and clean point to same enhanced image)
            timestamp = int(time.time())
            s3_key = f"wardrobe/{user_id}/item_{timestamp}.png"
            s3_url = await run_in_threadpool(
                upload_file_from_base64,
                cleaned_image,
                settings.AWS_S3_BUCKET_NAME,
                s3_key,
                'image/png'
            )
            
            if s3_url:
                logger.info(f"🤖 DEBUG: Enhanced image uploaded to S3: {s3_url}")
                # Use same URL for both - we only keep the AI-enhanced version
                item.image_original = s3_url
                item.image_clean = s3_url
                item.processing_status = ProcessingStatus.COMPLETED
                db.commit()
                logger.info(f"🤖 DEBUG: AI processing completed for item {item_id}")
            else:
                item.processing_status = ProcessingStatus.FAILED
                db.commit()
                logger.warning(f"🤖 DEBUG: Marking item {item_id} as FAILED because no enhanced image was saved")
        else:
            item.processing_status = ProcessingStatus.FAILED
            db.commit()
            logger.warning(f"🤖 DEBUG: Marking item {item_id} as FAILED because no enhanced image was generated")
        
    except Exception as e:
        logger.error(f"🤖 DEBUG: Error in background AI processing for item {item_id}: {e}")
        import traceback
        logger.error(f"🤖 DEBUG: Traceback: {traceback.format_exc()}")
        
        # Update status to FAILED
        try:
            item = db.query(WardrobeItem).filter(
                WardrobeItem.id == item_id,
                WardrobeItem.user_id == user_id
            ).first()
            if item:
                item.processing_status = ProcessingStatus.FAILED
                db.commit()
        except Exception as commit_error:
            logger.error(f"🤖 DEBUG: Failed to update status to FAILED: {commit_error}")
    
    finally:
        db.close()
        logger.info(f"🤖 DEBUG: Background task completed for item {item_id}")


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_wardrobe_item_endpoint(
    item: WardrobeItemCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id_for_testing)
):
    """
    🚀 Create a new wardrobe item with IMMEDIATE SAVE + BACKGROUND AI PROCESSING.
    
    Flow:
    1. Upload original image to S3 immediately
    2. Save item to database with processing_status='PENDING'
    3. Return item ID immediately to frontend
    4. Process AI enhancement + metadata extraction in background
    """
    logger.info("🤖 DEBUG: Creating new wardrobe item")
    
    # Verify user exists
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Handle image upload to S3 if provided
    updated_item_data = item.model_dump()
    image_base64_for_processing = None  # Store for background task
    
    # Upload image_original to S3 IMMEDIATELY (blocking, but fast)
    if item.image_original and item.image_original.startswith('data:'):
        if not settings.AWS_S3_BUCKET_NAME:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="S3 service not configured. Cannot upload images."
            )
        
        try:
            logger.info("🤖 DEBUG: Uploading original image to S3")
            # Upload original image
            mime, ext = parse_mime_and_ext(item.image_original)
            timestamp = int(time.time())
            s3_key_original = f"wardrobe/{user_id}/item_{timestamp}_original.{ext}"
            s3_url_original = await run_in_threadpool(
                upload_file_from_base64,
                item.image_original, 
                settings.AWS_S3_BUCKET_NAME, 
                s3_key_original, 
                mime
            )
            
            if s3_url_original:
                logger.info(f"🤖 DEBUG: Original image uploaded to S3: {s3_url_original}")
                updated_item_data['image_original'] = s3_url_original
                
                # Store base64 for background processing
                image_base64_for_processing = item.image_original
            else:
                logger.error("🤖 DEBUG: Failed to upload original image to S3")
                updated_item_data['image_original'] = None
        except Exception as e:
            logger.error(f"🤖 DEBUG: Error uploading image to S3: {e}")
            updated_item_data['image_original'] = None
    
    # 🚀 CREATE ITEM IMMEDIATELY with processing_status='PENDING'
    logger.info("🤖 DEBUG: Creating database entry with PENDING status")
    created_item = await run_in_threadpool(
        create_wardrobe_item,
        db,
        WardrobeItemCreate(**updated_item_data),
        user_id,
    )
    logger.info(f"🤖 DEBUG: Item created with ID: {created_item.id}")
    
    # 🤖 SCHEDULE BACKGROUND AI PROCESSING if image provided
    if image_base64_for_processing and settings.GEMINI_API_KEY:
        logger.info(f"🤖 DEBUG: Scheduling background AI processing for item {created_item.id}")
        from app.db import SessionLocal
        background_tasks.add_task(
            process_wardrobe_item_with_ai,
            created_item.id,
            user_id,
            image_base64_for_processing,
            SessionLocal
        )
        logger.info("🤖 DEBUG: Background task scheduled successfully")
    else:
        if not settings.GEMINI_API_KEY:
            logger.info("🤖 DEBUG: Gemini API key not configured, skipping AI processing")
        else:
            logger.info("🤖 DEBUG: No image provided, skipping AI processing")
    
    # 🎉 RETURN IMMEDIATELY - AI processing happens in background
    return serialize_wardrobe_item(created_item)


@router.put("/{item_id}")
def update_wardrobe_item_by_id(
    item_id: int,
    item_update: WardrobeItemUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id_for_testing)
):
    """Update a wardrobe item."""
    item = get_wardrobe_item(db, item_id, user_id)
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wardrobe item not found"
        )
    
    updated_item = update_wardrobe_item(db, item, item_update)
    return serialize_wardrobe_item(updated_item)


@router.patch("/{item_id}/status")
def update_wardrobe_item_status_endpoint(
    item_id: int,
    status_update: WardrobeItemStatusUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id_for_testing)
):
    """Update wardrobe item status (clean, worn, dirty)."""
    item = get_wardrobe_item(db, item_id, user_id)
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wardrobe item not found"
        )
    
    try:
        updated_item = update_wardrobe_item_status(db, item, status_update.status)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
    return serialize_wardrobe_item(updated_item)


@router.delete("/{item_id}")
def delete_wardrobe_item_by_id(
    item_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id_for_testing)
):
    """Delete a wardrobe item."""
    item = get_wardrobe_item(db, item_id, user_id)
    
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wardrobe item not found"
        )
    
    delete_wardrobe_item(db, item)
    return {"message": "Wardrobe item deleted successfully"}
