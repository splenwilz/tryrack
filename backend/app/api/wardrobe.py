from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import time

from app.db import get_db
from app.models import WardrobeItem
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
from app.services.gemini_service import remove_background

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
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
    }
    ext = ext_map.get(mime or '', 'jpg')
    
    return mime or 'image/jpeg', ext


def get_current_user_id_for_testing(
    user_id: int = Query(1, description="Test user ID for development")
):
    """Get current user ID - for testing without auth."""
    # For now, use a default user_id for testing
    # In production, this would use JWT authentication
    return user_id


def serialize_wardrobe_items(items: List[WardrobeItem]) -> List[dict]:
    """Serialize wardrobe items with lowercase status."""
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
            'created_at': item.created_at,
            'updated_at': item.updated_at,
        }
        result.append(item_dict)
    return result


@router.get("/")
async def list_wardrobe_items(
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
    """Serialize a single wardrobe item with lowercase status."""
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
        'created_at': item.created_at,
        'updated_at': item.updated_at,
    }


@router.get("/{item_id}")
async def get_wardrobe_item_by_id(
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


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_wardrobe_item_endpoint(
    item: WardrobeItemCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id_for_testing)
):
    """Create a new wardrobe item with optional S3 image upload."""
    # Verify user exists
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Handle image upload to S3 if provided
    updated_item_data = item.model_dump()
    
    # Upload image_original to S3 if it's a base64 data URL
    if item.image_original and item.image_original.startswith('data:'):
        if not settings.AWS_S3_BUCKET_NAME:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="S3 service not configured. Cannot upload images."
            )
        
        try:
            # Upload original image
            mime, ext = parse_mime_and_ext(item.image_original)
            timestamp = int(time.time())
            s3_key_original = f"wardrobe/{user_id}/item_{timestamp}_original.{ext}"
            s3_url_original = upload_file_from_base64(
                item.image_original, 
                settings.AWS_S3_BUCKET_NAME, 
                s3_key_original, 
                mime
            )
            
            if s3_url_original:
                logger.info(f"Original image uploaded to S3: {s3_url_original}")
                updated_item_data['image_original'] = s3_url_original
                
                # Process with Gemini for background removal if API key is configured
                if settings.GEMINI_API_KEY:
                    logger.info("Processing image with Gemini for background removal")
                    cleaned_image = await remove_background(item.image_original)
                    
                    if cleaned_image:
                        # Upload cleaned image to S3
                        s3_key_clean = f"wardrobe/{user_id}/item_{timestamp}_clean.png"
                        s3_url_clean = upload_file_from_base64(
                            cleaned_image,
                            settings.AWS_S3_BUCKET_NAME,
                            s3_key_clean,
                            'image/png'
                        )
                        
                        if s3_url_clean:
                            logger.info(f"Cleaned image uploaded to S3: {s3_url_clean}")
                            updated_item_data['image_clean'] = s3_url_clean
                        else:
                            logger.warning("Failed to upload cleaned image to S3")
                    else:
                        logger.warning("Gemini background removal returned no image")
                else:
                    logger.info("Gemini API key not configured, skipping background removal")
            else:
                logger.error("Failed to upload original image to S3")
                updated_item_data['image_original'] = None
        except Exception as e:
            logger.error(f"Error uploading image to S3: {e}")
            updated_item_data['image_original'] = None
    
    # Upload image_clean to S3 if provided
    if item.image_clean and item.image_clean.startswith('data:'):
        if settings.AWS_S3_BUCKET_NAME:
            try:
                mime, ext = parse_mime_and_ext(item.image_clean)
                s3_key = f"wardrobe/{user_id}/item_clean_{int(time.time())}.{ext}"
                s3_url = upload_file_from_base64(item.image_clean, settings.AWS_S3_BUCKET_NAME, s3_key, mime)
                
                if s3_url:
                    updated_item_data['image_clean'] = s3_url
            except Exception as e:
                logger.error(f"Error uploading clean image to S3: {e}")
                updated_item_data['image_clean'] = None
    
    # Create item with updated image URLs
    created_item = create_wardrobe_item(db, WardrobeItemCreate(**updated_item_data), user_id)
    return serialize_wardrobe_item(created_item)


@router.put("/{item_id}")
async def update_wardrobe_item_by_id(
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
async def update_wardrobe_item_status_endpoint(
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
    
    updated_item = update_wardrobe_item_status(db, item, status_update.status)
    return serialize_wardrobe_item(updated_item)


@router.delete("/{item_id}")
async def delete_wardrobe_item_by_id(
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
