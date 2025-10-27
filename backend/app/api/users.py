from fastapi import APIRouter, Depends, HTTPException, status, Header, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional, Annotated
import base64
import os
import uuid
import logging

logger = logging.getLogger(__name__)

from app.db import get_db
from app.schemas import User, UserCreate, UserUpdate, ProfileCompletion
from app.services import (
    get_user,
    get_user_by_email,
    get_users,
    create_user,
    update_user,
    delete_user,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[User])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all users."""
    users = get_users(db, skip=skip, limit=limit)
    return users


@router.get("/current", response_model=User)
async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Get current authenticated user from JWT token."""
    from app.core.auth import verify_token
    
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    try:
        # Extract token from "Bearer {token}" format
        token = authorization.replace("Bearer ", "").strip()
        payload = verify_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user = get_user(db, user_id=int(user_id))
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
    except ValueError as e:
        # Catch specific ValueError from verify_token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        ) from None
    except Exception as e:
        # Catch other unexpected errors
        logger.exception("Unexpected error during token verification")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        ) from None


@router.get("/{user_id}", response_model=User)
async def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID."""
    user = get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.post("/", response_model=User)
async def create_user_endpoint(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user."""
    db_user = get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return create_user(db=db, user=user)


@router.put("/{user_id}", response_model=User)
async def update_user_by_id(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db)
):
    """Update user."""
    user = get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return update_user(db=db, user=user, user_update=user_update)


@router.delete("/{user_id}")
async def delete_user_by_id(user_id: int, db: Session = Depends(get_db)):
    """Delete user."""
    user = get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    delete_user(db=db, user=user)
    return {"message": "User deleted successfully"}


@router.put("/{user_id}/profile", response_model=User)
async def complete_user_profile(
    user_id: int,
    profile_data: ProfileCompletion,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Complete user profile with body measurements and sizing."""
    from app.services.s3_service import upload_file_from_base64
    from app.core.config import settings
    from app.core.auth import verify_token
    import logging
    
    logger = logging.getLogger(__name__)
    
    # Security: Verify authorization header
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    try:
        token = authorization.replace("Bearer ", "").strip()
        payload = verify_token(token)
        caller_id = payload.get("sub")
        
        if not caller_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Check if caller is authorized to update this profile
        if int(caller_id) != int(user_id):
            # Forbidden - user trying to update another user's profile
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You can only update your own profile"
            )
    except ValueError as e:
        # Token verification failed - don't catch 403 Forbidden
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        ) from None
    except HTTPException:
        # Let 403 Forbidden and other HTTPExceptions propagate
        raise
    except Exception as e:
        # Catch other unexpected errors without leaking details
        logger.exception("Unexpected error during authorization check")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        ) from None
    
    user = get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    import time
    request_start = time.time()
    
    # Helper function to parse MIME type and extension from data URL
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
        
        extension_map = {
            "image/jpeg": "jpg",
            "image/jpg": "jpg",
            "image/png": "png",
            "image/webp": "webp"
        }
        
        if not mime or mime not in extension_map:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported image MIME type: {mime or 'unknown'}"
            )
        
        ext = extension_map[mime]
        return mime, ext
    
    # Log without sensitive data
    logger.info("Profile completion request received", extra={"user_id": user_id})
    logger.debug("Profile picture present: %s", bool(profile_data.profile_picture_url))
    # Do not log base64 previews or raw secrets
    
    # Prepare upload tasks for parallel execution
    upload_tasks = []
    
    if profile_data.profile_picture_url and profile_data.profile_picture_url.startswith('data:'):
        mime, ext = parse_mime_and_ext(profile_data.profile_picture_url)
        s3_key = f"users/{user_id}/profile.{ext}"
        upload_tasks.append(('profile', profile_data.profile_picture_url, s3_key, mime))
    elif profile_data.profile_picture_url:
        # External URL - use as is
        logger.debug("Using external URL for profile picture")
        user.profile_picture_url = profile_data.profile_picture_url
    
    if profile_data.full_body_image_url and profile_data.full_body_image_url.startswith('data:'):
        mime, ext = parse_mime_and_ext(profile_data.full_body_image_url)
        s3_key = f"users/{user_id}/fullbody.{ext}"
        upload_tasks.append(('fullbody', profile_data.full_body_image_url, s3_key, mime))
    elif profile_data.full_body_image_url:
        # External URL - use as is
        logger.debug("Using external URL for full body image")
        user.full_body_image_url = profile_data.full_body_image_url
    
    # Upload images in parallel
    if upload_tasks:
        # Check if S3 is configured
        if not settings.AWS_S3_BUCKET_NAME:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="S3 service not configured. Cannot upload images."
            )
        
        import concurrent.futures
        
        logger.info("Starting parallel uploads", extra={"count": len(upload_tasks)})
        parallel_start = time.time()
        
        def upload_image(image_type, base64_data, s3_key, content_type):
            upload_start = time.time()
            logger.debug("Starting image upload", extra={"type": image_type, "key": s3_key})
            s3_url = upload_file_from_base64(base64_data, settings.AWS_S3_BUCKET_NAME, s3_key, content_type)
            upload_time = (time.time() - upload_start) * 1000
            logger.debug("Image upload complete", extra={"type": image_type, "time_ms": upload_time})
            return (image_type, s3_url)
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            futures = [executor.submit(upload_image, img_type, img_data, key, mime) for img_type, img_data, key, mime in upload_tasks]
            results = []
            
            # Handle thread exceptions and fail fast on upload errors
            for future in concurrent.futures.as_completed(futures):
                try:
                    results.append(future.result())
                except Exception as err:
                    logger.exception("Image upload failed", extra={"error": str(err)})
                    raise HTTPException(
                        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                        detail="Image upload failed"
                    ) from None
        
        parallel_time = (time.time() - parallel_start) * 1000
        logger.info("All uploads complete", extra={"time_ms": parallel_time})
        
        # Update user with uploaded URLs - fail fast if any upload failed
        for img_type, s3_url in results:
            if not s3_url:
                logger.error("Failed to upload image", extra={"type": img_type})
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail=f"{img_type} upload failed"
                )
            
            if img_type == 'profile':
                user.profile_picture_url = s3_url
                logger.debug("Profile image uploaded", extra={"url": s3_url})
            else:
                user.full_body_image_url = s3_url
                logger.debug("Full body image uploaded", extra={"url": s3_url})
    
    # Update profile fields
    if profile_data.gender is not None:
        user.gender = profile_data.gender
    if profile_data.height is not None:
        user.height = profile_data.height
    if profile_data.weight is not None:
        user.weight = profile_data.weight
    if profile_data.clothing_sizes is not None:
        user.clothing_sizes = profile_data.clothing_sizes
    
    # Mark profile as completed only if essential data exists
    # Check if at least one field has been populated or if images were provided
    has_essential_data = (
        profile_data.gender is not None or
        profile_data.height is not None or
        profile_data.weight is not None or
        profile_data.clothing_sizes is not None or
        user.profile_picture_url or
        user.full_body_image_url
    )
    
    if has_essential_data:
        user.profile_completed = True
        logger.info("Profile marked as completed", extra={"user_id": user_id})
    else:
        logger.warning("Profile not marked as completed - no essential data provided", extra={"user_id": user_id})
    
    db_commit_start = time.time()
    db.commit()
    db.refresh(user)
    commit_time = (time.time() - db_commit_start) * 1000
    logger.debug("DB commit complete", extra={"time_ms": commit_time})
    
    total_time = (time.time() - request_start) * 1000
    logger.info("Profile completion request successful", extra={"time_ms": total_time})
    
    return user


@router.put("/{user_id}/user-type", response_model=User)
async def update_user_type(
    user_id: int,
    user_type: str = 'individual',
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Update user type (switch between individual and boutique)."""
    from app.models import UserType
    from app.core.auth import verify_token
    import logging
    
    logger = logging.getLogger(__name__)
    
    # Security: Verify authorization header
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    try:
        token = authorization.replace("Bearer ", "").strip()
        payload = verify_token(token)
        caller_id = payload.get("sub")
        
        if not caller_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Check if caller is authorized to update this profile
        if int(caller_id) != int(user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You can only update your own profile"
            )
    except ValueError as e:
        # Token verification failed - don't catch 403 Forbidden
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        ) from None
    except HTTPException:
        # Let 403 Forbidden and other HTTPExceptions propagate
        raise
    except Exception as e:
        # Catch other unexpected errors without leaking details
        logger.exception("Unexpected error during authorization check")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        ) from None
    
    user = get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Validate user_type
    if user_type not in ['individual', 'boutique']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_type must be 'individual' or 'boutique'"
        )
    
    logger.info("Updating user type", extra={"user_id": user_id, "user_type": user_type})
    
    # Update user_type
    user.user_type = UserType.INDIVIDUAL if user_type == 'individual' else UserType.BOUTIQUE
    
    db.commit()
    db.refresh(user)
    
    return user
