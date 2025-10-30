"""
Virtual Try-On API endpoints.
Handles generating and retrieving AI-powered virtual try-on results.
"""
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status, Query
from sqlalchemy.orm import Session
import logging
from typing import Optional, List, Dict

from app.db import get_db, SessionLocal
from app.schemas import VirtualTryOnRequest, VirtualTryOnResponse
from app.models import VirtualTryOnResult, VirtualTryOnStatus
from app.services.gemini_service import generate_virtual_tryon
from app.services.s3_service import upload_file_from_base64  # Only used for result upload
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# In-memory, short-lived cache to return base64 immediately on completion
TRYON_RESULT_CACHE: Dict[int, str] = {}

def get_current_user_id_for_testing(
    user_id: int = Query(4, description="Test user ID for development")
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


async def process_virtual_tryon_with_ai(
    tryon_id: int,
    user_id: int,
    user_image_url: Optional[str],
    item_image_url: Optional[str],
    item_category: str,
    item_colors: list[str],
    use_clean_background: bool = False,
    user_image_base64: Optional[str] = None,
    item_image_base64: Optional[str] = None,
):
    """
    Background task to generate virtual try-on with Gemini AI.
    
    This runs asynchronously after the API returns 202 Accepted.
    Updates the database record with the result or error.
    """
    import httpx
    import base64
    import asyncio
    import time
    
    # CRITICAL: Print to stdout IMMEDIATELY to verify background task is running
    print(f"\n{'='*80}")
    print(f"🚀 BACKGROUND TASK STARTED - Try-On ID: {tryon_id}")
    print(f"User ID: {user_id}, Category: {item_category}, Colors: {item_colors}")
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
        
        # Fetch both images from S3 in parallel (use compressed versions!)
        print(f"📥 [{elapsed:.1f}s] Fetching COMPRESSED images from S3...")
        print(f"   User: {user_image_url or '[base64 provided]'}")
        print(f"   Item: {item_image_url or '[base64 provided]'}")
        logger.info(f"📥 [{elapsed:.1f}s] Fetching images from S3 in parallel...")
        fetch_start = time.time()
        
        # Only fetch the images that are not provided as base64
        fetched_user_bytes = None
        fetched_item_bytes = None
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

        if not user_image_base64 or not item_image_base64:
            tasks = []
            if not user_image_base64 and user_image_url:
                tasks.append(fetch_with_retries(user_image_url, attempts=3, timeout=45.0))
            if not item_image_base64 and item_image_url:
                tasks.append(fetch_with_retries(item_image_url, attempts=3, timeout=45.0))
            # Execute tasks
            responses = await asyncio.gather(*tasks) if tasks else []
            # Map back in the same order as appended
            idx = 0
            if not user_image_base64 and user_image_url:
                fetched_user_bytes = responses[idx]
                idx += 1
            if not item_image_base64 and item_image_url:
                fetched_item_bytes = responses[idx]
        
        fetch_elapsed = time.time() - fetch_start
        total_elapsed = time.time() - start_time
        
        # Convert to base64
        # Compute sizes for logging
        if user_image_base64:
            user_image_size = (len(user_image_base64) * 3 / 4) / 1024 / 1024
        else:
            user_image_size = (len(fetched_user_bytes or b"")) / 1024 / 1024
        if item_image_base64:
            item_image_size = (len(item_image_base64) * 3 / 4) / 1024 / 1024
        else:
            item_image_size = (len(fetched_item_bytes or b"")) / 1024 / 1024
        print(f"⏱️ [{total_elapsed:.1f}s] S3 fetch took {fetch_elapsed:.1f}s")
        print(f"📊 [{total_elapsed:.1f}s] Downloaded - User: {user_image_size:.2f}MB, Item: {item_image_size:.2f}MB")
        logger.info(f"⏱️ [{total_elapsed:.1f}s] S3 fetch took {fetch_elapsed:.1f}s - User: {user_image_size:.2f}MB, Item: {item_image_size:.2f}MB")
        
        # Ensure base64 strings are available
        if not user_image_base64 and fetched_user_bytes is not None:
            user_image_base64 = base64.b64encode(fetched_user_bytes).decode('utf-8')
        if not item_image_base64 and fetched_item_bytes is not None:
            item_image_base64 = base64.b64encode(fetched_item_bytes).decode('utf-8')
        
        total_elapsed = time.time() - start_time
        print(f"✅ [{total_elapsed:.1f}s] Images fetched and converted to base64")
        logger.info(f"✅ [{total_elapsed:.1f}s] Images fetched and converted to base64")
        
        # Generate virtual try-on with Gemini
        print(f"🎨 [{total_elapsed:.1f}s] Calling Gemini API for virtual try-on...")
        logger.info(f"🎨 [{total_elapsed:.1f}s] Calling Gemini API for virtual try-on...")
        gemini_start = time.time()
        
        result_image_base64 = await generate_virtual_tryon(
            user_image_base64=user_image_base64,
            item_image_base64=item_image_base64,
            item_category=item_category,
            item_colors=item_colors,
            use_clean_background=use_clean_background
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
            
            # If S3 upload succeeded, update URL; otherwise keep base64-only completion
            if result_url:
                tryon_record.result_image_url = result_url
                db.commit()
                # Clear cached base64 once URL is available
                TRYON_RESULT_CACHE.pop(tryon_id, None)
            
            total_elapsed = time.time() - start_time
            print(f"✅ [{total_elapsed:.1f}s] Virtual try-on {tryon_id} completed. URL {'set' if result_url else 'pending'}.")
            logger.info(f"✅ [{total_elapsed:.1f}s] Virtual try-on {tryon_id} completed. URL {'set' if result_url else 'pending'}.")
        else:
            # Mark as failed
            tryon_record.status = VirtualTryOnStatus.FAILED
            tryon_record.error_message = "Failed to generate virtual try-on image with Gemini"
            db.commit()
            
            logger.error(f"❌ Virtual try-on {tryon_id} failed")
            
    except Exception as e:
        logger.error(f"❌ Error processing virtual try-on {tryon_id}: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        
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
    user_id: int = Depends(get_current_user_id_for_testing),
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


@router.post("/generate", status_code=status.HTTP_202_ACCEPTED, response_model=VirtualTryOnResponse)
async def generate_virtual_tryon_endpoint(
    request: VirtualTryOnRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id_for_testing)
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
        logger.info(f"📦 Item: {request.item_details.category}, Colors: {request.item_details.colors}")
        logger.info(f"📸 User image URL: {request.user_image_url}")
        
        # 1. Create VirtualTryOnResult record (no S3 upload needed!)
        # Use placeholders for URLs when base64 is provided to satisfy NOT NULL constraints
        user_image_url_value = request.user_image_url or ("inline://base64" if request.user_image_base64 else "unknown://missing")
        item_image_url_value = request.item_image_url or ("inline://base64" if request.item_image_base64 else "unknown://missing")

        tryon_record = VirtualTryOnResult(
            user_id=user_id,
            item_type=request.item_details.type,
            item_id="0",  # Can be populated if we have a specific item ID
            user_image_url=user_image_url_value,
            item_image_url=item_image_url_value,
            status=VirtualTryOnStatus.PROCESSING
        )
        
        db.add(tryon_record)
        db.commit()
        db.refresh(tryon_record)
        
        logger.info(f"✅ Created virtual try-on record with ID {tryon_record.id}")
        
        # 2. Start background processing
        background_tasks.add_task(
            process_virtual_tryon_with_ai,
            tryon_id=tryon_record.id,
            user_id=user_id,
            user_image_url=request.user_image_url,
            item_image_url=request.item_image_url,
            user_image_base64=request.user_image_base64,
            item_image_base64=request.item_image_base64,
            item_category=request.item_details.category,
            item_colors=request.item_details.colors,
            use_clean_background=request.use_clean_background
        )
        
        logger.info(f"🚀 Background processing started for try-on {tryon_record.id}")
        
        # 3. Return 202 Accepted with the record
        return VirtualTryOnResponse.model_validate(tryon_record)
        
    except Exception as e:
        logger.error(f"❌ Error creating virtual try-on: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create virtual try-on: {str(e)}"
        )


@router.get("/{tryon_id}", response_model=VirtualTryOnResponse)
async def get_tryon_result(
    tryon_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id_for_testing)
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
        logger.error(f"❌ Error fetching virtual try-on {tryon_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch virtual try-on: {str(e)}"
        )


@router.delete("/{tryon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tryon(
    tryon_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id_for_testing)
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
        logger.error(f"❌ Error deleting virtual try-on {tryon_id}: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete virtual try-on: {str(e)}"
        )

