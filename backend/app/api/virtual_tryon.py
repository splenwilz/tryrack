"""
Virtual Try-On API endpoints.
Handles generating and retrieving AI-powered virtual try-on results.
"""
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status, Query
from sqlalchemy.orm import Session
import logging
from typing import Optional, List, Dict, Any

from app.db import get_db, SessionLocal
from app.core.auth import get_current_user_id
from app.schemas import VirtualTryOnRequest, VirtualTryOnResponse
from app.models import VirtualTryOnResult, VirtualTryOnStatus
from app.services.gemini_service import generate_virtual_tryon
from app.services.s3_service import upload_file_from_base64  # Only used for result upload
from app.services.outfit_service import get_compatible_items
from app.services import get_user, get_wardrobe_items, get_wardrobe_item
from app.api.wardrobe import serialize_wardrobe_items  # Reuse wardrobe serialization
from app.core.config import settings

router = APIRouter(dependencies=[Depends(get_current_user_id)])
logger = logging.getLogger(__name__)

# In-memory, short-lived cache to return base64 immediately on completion
TRYON_RESULT_CACHE: Dict[int, str] = {}


async def process_virtual_tryon_with_ai(
    tryon_id: int,
    user_id: int,
    user_image_url: Optional[str],
    items: List[Dict[str, Any]],  # List of items with image_base64, category, colors, etc.
    use_clean_background: bool = False,
    user_image_base64: Optional[str] = None,
    item_image_urls: Optional[List[str]] = None,  # Optional: URLs for items if base64 not provided
    custom_prompt: Optional[str] = None,  # Optional: user-defined custom prompt
):
    """
    Background task to generate virtual try-on with Gemini AI.
    
    Supports both single-item and multi-item try-ons.
    This runs asynchronously after the API returns 202 Accepted.
    Updates the database record with the result or error.
    
    Args:
        tryon_id: ID of the try-on record
        user_id: User ID
        user_image_url: Optional URL for user image
        items: List of item dictionaries with image_base64, category, colors
        use_clean_background: Whether to use clean background
        user_image_base64: Optional base64 user image
        item_image_urls: Optional list of item image URLs (if base64 not provided)
    """
    import httpx
    import base64
    import asyncio
    import time
    
    # CRITICAL: Print to stdout IMMEDIATELY to verify background task is running
    num_items = len(items) if items else 0
    item_categories = [item.get("category", "unknown") for item in (items or [])]
    print(f"\n{'='*80}")
    print(f"🚀 BACKGROUND TASK STARTED - Try-On ID: {tryon_id}")
    print(f"User ID: {user_id}, Items: {num_items} ({', '.join(item_categories)})")
    print(f"Use Clean BG: {use_clean_background}")
    print(f"{'='*80}\n")
    
    # Reuse the application's SessionLocal (avoid creating a new engine per task)
    db = SessionLocal()
    
    try:
        start_time = time.time()
        print(f"⏱️ [0.0s] Starting AI processing for virtual try-on ID {tryon_id}")
        logger.info(f"⏱️ [0.0s] Starting AI processing for virtual try-on ID {tryon_id}")
        
        # Update status to PROCESSING
        tryon_record = db.query(VirtualTryOnResult).filter(
            VirtualTryOnResult.id == tryon_id
        ).first()
        
        if not tryon_record:
            logger.error(f"❌ Virtual try-on record {tryon_id} not found")
            return
        
        tryon_record.status = VirtualTryOnStatus.PROCESSING
        db.commit()
        
        elapsed = time.time() - start_time
        print(f"⏱️ [{elapsed:.1f}s] Status updated to PROCESSING")
        logger.info(f"⏱️ [{elapsed:.1f}s] Status updated to PROCESSING")
        
        # Fetch images from S3 in parallel (use compressed versions!)
        print(f"📥 [{elapsed:.1f}s] Fetching images from S3...")
        print(f"   User: {user_image_url or '[base64 provided]'}")
        print(f"   Items: {num_items} item(s)")
        logger.info(f"📥 [{elapsed:.1f}s] Fetching images from S3 in parallel...")
        fetch_start = time.time()
        
        async def fetch_with_retries(url: str, attempts: int = 3, timeout: float = 30.0):
            last_exc = None
            for i in range(attempts):
                try:
                    async with httpx.AsyncClient(timeout=timeout) as c:
                        r = await c.get(url)
                        r.raise_for_status()
                        return r.content
                except Exception as e:
                    last_exc = e
                    await asyncio.sleep(1.5 * (i + 1))
            raise last_exc

        # Fetch user image if not provided as base64
        fetched_user_bytes = None
        if not user_image_base64 and user_image_url:
            fetched_user_bytes = await fetch_with_retries(user_image_url, attempts=3, timeout=45.0)
        
        # Fetch item images that don't have base64
        # For wardrobe items, we need to fetch from database first to get image URLs
        item_urls_to_fetch = []
        item_url_indices = []  # Track which item index each URL corresponds to
        
        for idx, item in enumerate(items):
            # Skip if already has base64
            if item.get("image_base64"):
                continue
            
            item_id = item.get("item_id")
            item_type = item.get("item_type", "").lower()
            
            # For wardrobe items, fetch from database to get image URL
            if item_type == "wardrobe" and item_id and item_id != "0":
                try:
                    print(f"   📦 Looking up wardrobe item {item_id} (index {idx}: {item.get('category', 'unknown')})")
                    logger.info(f"📦 Looking up wardrobe item {item_id} (index {idx}: {item.get('category', 'unknown')})")
                    
                    wardrobe_item = get_wardrobe_item(db, int(item_id), user_id)
                    if wardrobe_item:
                        # Prefer clean image, fallback to original
                        image_url = wardrobe_item.image_clean or wardrobe_item.image_original
                        if image_url:
                            item_urls_to_fetch.append(image_url)
                            item_url_indices.append(idx)
                            # Store tags and formality for formality detection and enhanced prompts
                            items[idx]["tags"] = wardrobe_item.tags or []
                            items[idx]["formality"] = wardrobe_item.formality
                            print(f"   ✅ Found image URL for wardrobe item {item_id} ({item.get('category', 'unknown')}): {image_url[:80]}...")
                            logger.info(f"📦 Found image URL for wardrobe item {item_id}: {image_url}")
                        else:
                            print(f"   ⚠️ Wardrobe item {item_id} ({item.get('category', 'unknown')}) has no image URL")
                            logger.warning(f"⚠️ Wardrobe item {item_id} has no image URL")
                    else:
                        print(f"   ⚠️ Wardrobe item {item_id} ({item.get('category', 'unknown')}) not found in database")
                        logger.warning(f"⚠️ Wardrobe item {item_id} not found")
                except (ValueError, TypeError) as e:
                    print(f"   ⚠️ Invalid item_id '{item_id}' for wardrobe item: {e}")
                    logger.warning(f"⚠️ Invalid item_id '{item_id}' for wardrobe item: {e}")
                except Exception as e:
                    print(f"   ⚠️ Error fetching wardrobe item {item_id}: {e}")
                    logger.warning(f"⚠️ Error fetching wardrobe item {item_id}: {e}")
            # For items with URLs provided directly (legacy support or boutique items)
            elif item_image_urls and idx < len(item_image_urls) and item_image_urls[idx]:
                item_urls_to_fetch.append(item_image_urls[idx])
                item_url_indices.append(idx)
        
        # Execute all fetch tasks in parallel (user + all items)
        fetch_tasks = []
        user_fetch_idx = -1
        if fetched_user_bytes is None and user_image_url:
            user_fetch_idx = len(fetch_tasks)
            fetch_tasks.append(fetch_with_retries(user_image_url, attempts=3, timeout=45.0))
        
        # Add item fetch tasks
        for item_url in item_urls_to_fetch:
            fetch_tasks.append(fetch_with_retries(item_url, attempts=3, timeout=45.0))
        
        fetched_responses = await asyncio.gather(*fetch_tasks, return_exceptions=True) if fetch_tasks else []
        
        # Map responses back
        response_idx = 0
        
        # Handle user image
        if user_fetch_idx >= 0:
            if response_idx < len(fetched_responses):
                user_response = fetched_responses[response_idx]
                if isinstance(user_response, Exception):
                    logger.error(f"❌ Failed to fetch user image: {user_response}")
                else:
                    fetched_user_bytes = user_response
                response_idx += 1
        
        # Map item image responses
        for url_idx, item_idx in enumerate(item_url_indices):
            if response_idx < len(fetched_responses):
                item_response = fetched_responses[response_idx]
                item_category = items[item_idx].get('category', 'unknown')
                item_id = items[item_idx].get('item_id', 'unknown')
                
                if isinstance(item_response, Exception):
                    error_msg = str(item_response)
                    print(f"   ❌ Failed to fetch image for item {item_idx} ({item_category}, ID: {item_id}): {error_msg}")
                    logger.warning(f"⚠️ Failed to fetch image for item {item_idx} ({item_category}, ID: {item_id}): {error_msg}")
                    
                    # For DNS errors, log the URL we tried to fetch
                    if url_idx < len(item_urls_to_fetch):
                        attempted_url = item_urls_to_fetch[url_idx]
                        print(f"   📍 Attempted URL: {attempted_url}")
                        logger.warning(f"📍 Attempted URL for item {item_idx}: {attempted_url}")
                else:
                    item_bytes = item_response
                    # Convert to base64 and add to item
                    items[item_idx]["image_base64"] = base64.b64encode(item_bytes).decode('utf-8')
                    item_size_mb = len(item_bytes) / 1024 / 1024
                    print(f"   ✅ Fetched image for item {item_idx} ({item_category}, ID: {item_id}): {item_size_mb:.2f}MB")
                    logger.info(f"✅ Fetched image for item {item_idx} ({item_category}): {item_size_mb:.2f}MB")
                response_idx += 1
        
        fetch_elapsed = time.time() - fetch_start
        total_elapsed = time.time() - start_time
        
        # Convert user image to base64 if needed
        if not user_image_base64 and fetched_user_bytes is not None:
            user_image_base64 = base64.b64encode(fetched_user_bytes).decode('utf-8')
        
        if not user_image_base64:
            logger.error("❌ No user image available (neither base64 nor URL provided)")
            tryon_record.status = VirtualTryOnStatus.FAILED
            tryon_record.error_message = "User image is required"
            db.commit()
            return
        
        # Ensure all items have image_base64
        processed_items = []
        skipped_items = []
        for item_idx, item in enumerate(items):
            if not item.get("image_base64"):
                category = item.get('category', 'unknown')
                item_id = item.get('item_id', 'unknown')
                skipped_items.append(f"{category} (ID: {item_id})")
                print(f"   ⚠️ Item {item_idx} ({category}, ID: {item_id}) missing image, skipping")
                logger.warning(f"⚠️ Item {category} (ID: {item_id}) missing image, skipping")
                continue
            processed_items.append(item)
        
        # Summary log
        total_elapsed = time.time() - start_time
        print(f"📊 [{total_elapsed:.1f}s] Image fetch summary:")
        print(f"   ✅ Items ready: {len(processed_items)}/{num_items}")
        for idx, item in enumerate(processed_items):
            print(f"      [{idx+1}] {item.get('category', 'unknown')} (ID: {item.get('item_id', 'unknown')})")
        if skipped_items:
            print(f"   ❌ Skipped items: {len(skipped_items)}")
            for skipped in skipped_items:
                print(f"      - {skipped}")
        
        if not processed_items:
            error_msg = "No valid items with images found"
            print(f"❌ {error_msg}")
            logger.error(f"❌ {error_msg}")
            tryon_record.status = VirtualTryOnStatus.FAILED
            tryon_record.error_message = error_msg
            db.commit()
            return
        
        # Warn if some items were skipped
        if len(processed_items) < num_items:
            warning_msg = f"Only {len(processed_items)}/{num_items} items have valid images. Try-on will proceed with available items only."
            print(f"⚠️ {warning_msg}")
            logger.warning(f"⚠️ {warning_msg}")
        
        # Compute sizes for logging
        user_image_size = (len(user_image_base64) * 3 / 4) / 1024 / 1024
        total_item_size = sum(
            (len(item.get("image_base64", "")) * 3 / 4) / 1024 / 1024 
            for item in processed_items
        )
        print(f"⏱️ [{total_elapsed:.1f}s] S3 fetch took {fetch_elapsed:.1f}s")
        print(f"📊 [{total_elapsed:.1f}s] Downloaded - User: {user_image_size:.2f}MB, Items: {total_item_size:.2f}MB total")
        logger.info(f"⏱️ [{total_elapsed:.1f}s] S3 fetch took {fetch_elapsed:.1f}s - User: {user_image_size:.2f}MB, Items: {total_item_size:.2f}MB total")
        
        total_elapsed = time.time() - start_time
        print(f"✅ [{total_elapsed:.1f}s] Images fetched and converted to base64")
        logger.info(f"✅ [{total_elapsed:.1f}s] Images fetched and converted to base64")
        
        # Generate virtual try-on with Gemini
        print(f"🎨 [{total_elapsed:.1f}s] Calling Gemini API for virtual try-on with {len(processed_items)} item(s)...")
        logger.info(f"🎨 [{total_elapsed:.1f}s] Calling Gemini API for virtual try-on with {len(processed_items)} item(s)...")
        gemini_start = time.time()
        
        # Prepare items in format expected by generate_virtual_tryon
        # Include tags and formality for formality detection and enhanced prompts
        gemini_items = [
            {
                "image_base64": item.get("image_base64", ""),
                "category": item.get("category", "item"),
                "colors": item.get("colors", []),
                "tags": item.get("tags", []),  # Include tags for formality detection
                "formality": item.get("formality")  # Include formality score if available
            }
            for item in processed_items
        ]
        
        result_image_base64 = await generate_virtual_tryon(
            user_image_base64=user_image_base64,
            items=gemini_items,
            use_clean_background=use_clean_background,
            custom_prompt=custom_prompt
        )
        
        gemini_elapsed = time.time() - gemini_start
        total_elapsed = time.time() - start_time
        print(f"⏱️ [{total_elapsed:.1f}s] Gemini API took {gemini_elapsed:.1f}s")
        logger.info(f"⏱️ [{total_elapsed:.1f}s] Gemini API took {gemini_elapsed:.1f}s")
        
        if result_image_base64:
            # First, mark as completed and expose base64 via cache for instant UI
            TRYON_RESULT_CACHE[tryon_id] = result_image_base64
            tryon_record.status = VirtualTryOnStatus.COMPLETED
            db.commit()
            print(f"✅ [{total_elapsed:.1f}s] Marked try-on {tryon_id} as COMPLETED (base64 available). Proceeding to S3 upload in background of this task...")
            logger.info(f"✅ [{total_elapsed:.1f}s] Marked try-on {tryon_id} as COMPLETED (base64 available). Proceeding to S3 upload...")

            # Upload result to S3 as PNG for higher quality (lossless)
            s3_key = f"virtual-tryon/{user_id}/tryon_{tryon_id}_result.png"
            print(f"📤 [{total_elapsed:.1f}s] Uploading result to S3: {s3_key}")
            logger.info(f"📤 [{total_elapsed:.1f}s] Uploading result to S3: {s3_key}")
            upload_start = time.time()
            
            from fastapi.concurrency import run_in_threadpool
            
            result_url = await run_in_threadpool(
                upload_file_from_base64,
                result_image_base64,
                settings.AWS_S3_BUCKET_NAME,
                s3_key,
                "image/png"
            )
            
            upload_elapsed = time.time() - upload_start
            total_elapsed = time.time() - start_time
            print(f"⏱️ [{total_elapsed:.1f}s] S3 upload took {upload_elapsed:.1f}s")
            logger.info(f"⏱️ [{total_elapsed:.1f}s] S3 upload took {upload_elapsed:.1f}s")
            
            # If S3 upload succeeded, update URL; if it fails, mark FAILED and clear cache
            if result_url:
                tryon_record.result_image_url = result_url
                db.commit()
                # Clear cached base64 once URL is available
                TRYON_RESULT_CACHE.pop(tryon_id, None)
            else:
                tryon_record.status = VirtualTryOnStatus.FAILED
                tryon_record.error_message = "Failed to upload virtual try-on result to S3"
                db.commit()
                TRYON_RESULT_CACHE.pop(tryon_id, None)
            
            total_elapsed = time.time() - start_time
            if result_url:
                print(f"✅ [{total_elapsed:.1f}s] Virtual try-on {tryon_id} completed. URL set.")
                logger.info(f"✅ [{total_elapsed:.1f}s] Virtual try-on {tryon_id} completed. URL set.")
            else:
                print(f"❌ [{total_elapsed:.1f}s] S3 upload failed; marked try-on {tryon_id} as FAILED.")
                logger.error(f"❌ [{total_elapsed:.1f}s] S3 upload failed; marked try-on {tryon_id} as FAILED.")
        else:
            # Mark as failed
            tryon_record.status = VirtualTryOnStatus.FAILED
            tryon_record.error_message = "Failed to generate virtual try-on image with Gemini"
            db.commit()
            
            logger.error(f"❌ Virtual try-on {tryon_id} failed")
            
    except Exception as e:
        logger.exception(f"❌ Error processing virtual try-on {tryon_id}: {e}")
        
        # Mark as failed
        try:
            tryon_record = db.query(VirtualTryOnResult).filter(
                VirtualTryOnResult.id == tryon_id
            ).first()
            if tryon_record:
                tryon_record.status = VirtualTryOnStatus.FAILED
                tryon_record.error_message = str(e)[:500]  # Limit error message length
                db.commit()
        except Exception as db_error:
            logger.error(f"❌ Failed to update error status: {db_error}")
    finally:
        db.close()


@router.get("/", response_model=List[VirtualTryOnResponse])
async def list_user_tryons(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
    status_filter: Optional[str] = Query(None, description="Filter by status: completed, processing, failed"),
    limit: int = Query(50, ge=1, le=100, description="Number of results to return"),
    offset: int = Query(0, ge=0, description="Number of results to skip")
):
    """
    Get all virtual try-ons for the current user.
    
    Returns:
    - List of try-on results, newest first
    - By default, only shows completed try-ons
    - Use status_filter to include processing or failed attempts
    """
    try:
        logger.info(f"📋 Fetching try-on history for user {user_id}")
        
        # Build query
        query = db.query(VirtualTryOnResult).filter(
            VirtualTryOnResult.user_id == user_id
        )
        
        # Filter by status if provided
        if status_filter:
            try:
                status_enum = VirtualTryOnStatus(status_filter)
                query = query.filter(VirtualTryOnResult.status == status_enum)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid status filter. Use: completed, processing, or failed"
                )
        else:
            # By default, only show completed try-ons
            query = query.filter(VirtualTryOnResult.status == VirtualTryOnStatus.COMPLETED)
        
        # Order by newest first and apply pagination
        tryons = query.order_by(
            VirtualTryOnResult.created_at.desc()
        ).limit(limit).offset(offset).all()
        
        logger.info(f"✅ Found {len(tryons)} try-on results for user {user_id}")
        
        return [VirtualTryOnResponse.model_validate(t) for t in tryons]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error fetching try-on history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch try-on history: {str(e)}"
        )


@router.get("/suggestions")
async def get_tryon_suggestions(
    category: str = Query(..., description="Category of item being tried on (e.g., 'top', 'bottom')"),
    colors: Optional[str] = Query(None, description="Comma-separated list of item colors (e.g., 'blue,white')"),
    item_id: Optional[int] = Query(None, description="Optional wardrobe item ID to extract tags from"),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get compatible wardrobe items to pair with an item being tried on.
    
    Returns suggestions from user's wardrobe that are:
    - In compatible categories (top pairs with bottom, etc.)
    - Color-coordinated (neutral, complementary, or analogous colors)
    - Style-matched (formal with formal, casual with casual)
    - Clean (available for use)
    
    Suggestions are ranked by compatibility score (0.0-1.0).
    
    Example: GET /virtual-tryon/suggestions?category=top&colors=blue,white
    """
    try:
        logger.info(f"🎯 Getting suggestions for category '{category}' for user {user_id}, item_id={item_id}")
        
        # Parse colors from query string
        item_colors = []
        if colors:
            item_colors = [c.strip() for c in colors.split(',') if c.strip()]
        logger.info(f"🎯 Item colors: {item_colors}")
        
        # Extract tags from selected item if item_id provided
        item_tags = []
        if item_id:
            try:
                logger.info(f"🔍 Fetching wardrobe item {item_id} for tag extraction...")
                selected_item = get_wardrobe_item(db, item_id, user_id)
                if selected_item:
                    logger.info(f"✅ Found item {item_id}: {selected_item.title}, tags: {selected_item.tags}")
                    if selected_item.tags:
                        item_tags = selected_item.tags
                        logger.info(f"📋 Extracted tags from item {item_id}: {item_tags}")
                    else:
                        logger.info(f"⚠️ Item {item_id} has no tags")
                else:
                    logger.warning(f"❌ Item {item_id} not found or not owned by user {user_id}")
            except Exception:
                logger.exception(f"❌ Could not extract tags from item {item_id}")
        else:
            logger.info(f"ℹ️ No item_id provided, will use empty tags for style compatibility")
        
        # Get user to access gender (optional for gender-aware suggestions)
        user = get_user(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get user's wardrobe items (only clean items)
        wardrobe_items = get_wardrobe_items(
            db, 
            user_id, 
            status="clean",  # Only suggest clean items
            limit=100  # Get enough items to find matches
        )
        
        if not wardrobe_items:
            logger.info(f"No wardrobe items found for user {user_id}")
            return {
                "category": category,
                "item_colors": item_colors,
                "suggestions": [],
                "message": "No wardrobe items found. Add items to your wardrobe to get suggestions."
            }
        
        # Get compatible items using outfit service
        compatible_items = get_compatible_items(
            item_category=category,
            item_colors=item_colors,
            item_tags=item_tags,  # Pass tags from selected item
            wardrobe_items=wardrobe_items
        )
        
        # Serialize wardrobe items for response
        suggestions = []
        for comp_item in compatible_items:
            # Serialize the wardrobe item
            item_dict = serialize_wardrobe_items([comp_item["item"]])[0]
            
            # Add compatibility metadata
            suggestions.append({
                **item_dict,
                "compatibility_score": comp_item["score"],
                "compatibility_reasons": comp_item["reasons"]
            })
        
        logger.info(f"✅ Found {len(suggestions)} compatible items for category '{category}'")
        
        return {
            "category": category,
            "item_colors": item_colors,
            "suggestions": suggestions,
            "total_suggestions": len(suggestions)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Error getting try-on suggestions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get suggestions: {str(e)}"
        ) from e


@router.post("/generate", status_code=status.HTTP_202_ACCEPTED, response_model=VirtualTryOnResponse)
async def generate_virtual_tryon_endpoint(
    request: VirtualTryOnRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Generate a virtual try-on image.
    
    This endpoint:
    1. Creates a VirtualTryOnResult record with status=PROCESSING
    2. Returns 202 Accepted immediately with the tryon_id
    3. Processes the image with Gemini AI in the background
    
    The frontend should poll GET /{tryon_id} to check the status.
    """
    try:
        logger.info(f"🎨 Virtual try-on request from user {user_id}")
        
        # Handle list of items (multi-item support)
        item_details_list = request.item_details if isinstance(request.item_details, list) else [request.item_details]
        num_items = len(item_details_list)
        logger.info(f"📦 Items: {num_items} item(s)")
        for idx, item_detail in enumerate(item_details_list):
            logger.info(f"   [{idx+1}] {item_detail.category} in {item_detail.colors}")
        
        logger.info(f"📸 User image URL: {request.user_image_url}")
        
        # 1. Prepare items data for database storage and processing
        items_data = []
        item_image_urls_list = []
        
        # For backward compatibility, also handle legacy single item_image_url/base64
        # If only one item and legacy fields are provided, use them
        if num_items == 1 and (request.item_image_url or request.item_image_base64):
            # Legacy single-item format - convert to new format
            item_detail = item_details_list[0]
            items_data.append({
                "item_id": item_detail.item_id or "0",
                "item_type": item_detail.type,
                "category": item_detail.category,
                "colors": item_detail.colors
            })
            item_image_urls_list = [request.item_image_url] if request.item_image_url else []
            # item_image_base64 will be handled in processing function
        else:
            # Multi-item format - extract from item_details
            for item_detail in item_details_list:
                items_data.append({
                    "item_id": item_detail.item_id or "0",
                    "item_type": item_detail.type,
                    "category": item_detail.category,
                    "colors": item_detail.colors
                })
        
        # 2. Create VirtualTryOnResult record (no S3 upload needed!)
        # Use placeholders for URLs when base64 is provided to satisfy NOT NULL constraints
        user_image_url_value = request.user_image_url or ("inline://base64" if request.user_image_base64 else "unknown://missing")
        
        # Legacy fields: use first item for backward compatibility
        first_item = item_details_list[0]
        item_image_url_value = request.item_image_url or ("inline://base64" if request.item_image_base64 else "unknown://missing")

        tryon_record = VirtualTryOnResult(
            user_id=user_id,
            item_type=first_item.type,  # Legacy: first item's type
            item_id=first_item.item_id or "0",  # Legacy: first item's ID
            user_image_url=user_image_url_value,
            item_image_url=item_image_url_value,  # Legacy: first item's image URL
            items=items_data,  # New: store all items as JSON
            status=VirtualTryOnStatus.PROCESSING
        )
        
        db.add(tryon_record)
        db.commit()
        db.refresh(tryon_record)
        
        logger.info(f"✅ Created virtual try-on record with ID {tryon_record.id} ({num_items} items)")
        
        # 3. Prepare items for background processing
        # Items need image_base64 or will be fetched from URLs
        processing_items = []
        for idx, item_detail in enumerate(item_details_list):
            item_dict = {
                "item_id": item_detail.item_id or "0",
                "item_type": item_detail.type,
                "category": item_detail.category,
                "colors": item_detail.colors
            }
            # Add image_base64 if provided for this item (future: per-item base64)
            # For now, handle legacy single item_image_base64
            if idx == 0 and request.item_image_base64:
                item_dict["image_base64"] = request.item_image_base64
            processing_items.append(item_dict)
        
        # 4. Start background processing
        background_tasks.add_task(
            process_virtual_tryon_with_ai,
            tryon_id=tryon_record.id,
            user_id=user_id,
            user_image_url=request.user_image_url,
            items=processing_items,
            use_clean_background=request.use_clean_background,
            user_image_base64=request.user_image_base64,
            item_image_urls=item_image_urls_list if item_image_urls_list else None,
            custom_prompt=request.custom_prompt
        )
        
        logger.info(f"🚀 Background processing started for try-on {tryon_record.id}")
        
        # 5. Return 202 Accepted with the record
        return VirtualTryOnResponse.model_validate(tryon_record)
        
    except Exception as e:
        logger.exception(f"❌ Error creating virtual try-on: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create virtual try-on: {str(e)}"
        ) from e


@router.get("/{tryon_id}", response_model=VirtualTryOnResponse)
async def get_tryon_result(
    tryon_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get the status and result of a virtual try-on.
    
    The frontend should poll this endpoint to check:
    - status: "processing" | "completed" | "failed"
    - result_image_url: S3 URL when status is "completed"
    - error_message: Error details when status is "failed"
    """
    try:
        # Fetch the virtual try-on record
        tryon_record = db.query(VirtualTryOnResult).filter(
            VirtualTryOnResult.id == tryon_id,
            VirtualTryOnResult.user_id == user_id
        ).first()
        
        if not tryon_record:
            logger.warning(f"⚠️ Virtual try-on {tryon_id} not found for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Virtual try-on not found"
            )
        
        logger.info(f"📊 Virtual try-on {tryon_id} status: {tryon_record.status.value}")

        # Build response and include base64 if available and URL not yet set
        data = VirtualTryOnResponse.model_validate(tryon_record).model_dump()
        if tryon_record.status == VirtualTryOnStatus.COMPLETED and not tryon_record.result_image_url:
            b64 = TRYON_RESULT_CACHE.get(tryon_id)
            if b64:
                data["result_image_base64"] = b64
        return data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Error fetching virtual try-on {tryon_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch virtual try-on: {str(e)}"
        ) from e


@router.delete("/{tryon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tryon(
    tryon_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Delete a virtual try-on result.
    Only the owner can delete their own try-ons.
    """
    try:
        logger.info(f"🗑️ Deleting virtual try-on {tryon_id} for user {user_id}")
        
        # Fetch the virtual try-on record
        tryon_record = db.query(VirtualTryOnResult).filter(
            VirtualTryOnResult.id == tryon_id,
            VirtualTryOnResult.user_id == user_id
        ).first()
        
        if not tryon_record:
            logger.warning(f"⚠️ Virtual try-on {tryon_id} not found for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Virtual try-on not found"
            )
        
        # Delete from database
        db.delete(tryon_record)
        db.commit()
        
        logger.info(f"✅ Successfully deleted virtual try-on {tryon_id}")
        
        # Note: S3 cleanup could be done here with S3 service, but we'll leave files for now
        # as they might be cached/shared elsewhere
        
        return None  # 204 No Content
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"❌ Error deleting virtual try-on {tryon_id}: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete virtual try-on: {str(e)}"
        ) from e

