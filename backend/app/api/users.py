from fastapi import APIRouter, Depends, HTTPException, status, Header, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional, Annotated
import base64
import os
import uuid

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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )


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
    db: Session = Depends(get_db)
):
    """Complete user profile with body measurements and sizing."""
    from app.services.s3_service import upload_file_from_base64
    from app.core.config import settings
    
    user = get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    import time
    request_start = time.time()
    
    # Upload images to S3 if provided (base64 data)
    print(f"🔴 Backend - Profile completion request received for user {user_id}")
    print(f"🔴 Backend - profile_picture_url exists: {profile_data.profile_picture_url is not None}")
    print(f"🔴 Backend - profile_picture_url preview: {profile_data.profile_picture_url[:50] if profile_data.profile_picture_url else None}...")
    print(f"🔴 Backend - Bucket: {settings.AWS_S3_BUCKET_NAME}")
    
    # Prepare upload tasks for parallel execution
    upload_tasks = []
    
    if profile_data.profile_picture_url and profile_data.profile_picture_url.startswith('data:'):
        s3_key = f"users/{user_id}/profile.jpg"
        upload_tasks.append(('profile', profile_data.profile_picture_url, s3_key))
    elif profile_data.profile_picture_url:
        # External URL - use as is
        print(f"🔴 Backend - Using external URL for profile picture")
        user.profile_picture_url = profile_data.profile_picture_url
    
    if profile_data.full_body_image_url and profile_data.full_body_image_url.startswith('data:'):
        s3_key = f"users/{user_id}/fullbody.jpg"
        upload_tasks.append(('fullbody', profile_data.full_body_image_url, s3_key))
    elif profile_data.full_body_image_url:
        # External URL - use as is
        print(f"🔴 Backend - Using external URL for full body image")
        user.full_body_image_url = profile_data.full_body_image_url
    
    # Upload images in parallel
    if upload_tasks:
        import concurrent.futures
        
        print(f"🔴 Backend - Uploading {len(upload_tasks)} images in parallel...")
        parallel_start = time.time()
        
        def upload_image(image_type, base64_data, s3_key):
            upload_start = time.time()
            print(f"🔴 Backend - Starting {image_type} image upload: {s3_key}")
            s3_url = upload_file_from_base64(base64_data, settings.AWS_S3_BUCKET_NAME, s3_key)
            upload_time = (time.time() - upload_start) * 1000
            print(f"⏱️ Backend - {image_type} image upload took: {upload_time:.0f}ms")
            return (image_type, s3_url)
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
            futures = [executor.submit(upload_image, img_type, img_data, key) for img_type, img_data, key in upload_tasks]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        parallel_time = (time.time() - parallel_start) * 1000
        print(f"✅ Backend - All uploads complete! Total parallel time: {parallel_time:.0f}ms")
        
        # Update user with uploaded URLs
        for img_type, s3_url in results:
            if s3_url:
                if img_type == 'profile':
                    user.profile_picture_url = s3_url
                    print(f"✅ Backend - Profile image uploaded to S3: {s3_url}")
                else:
                    user.full_body_image_url = s3_url
                    print(f"✅ Backend - Full body image uploaded to S3: {s3_url}")
            else:
                print(f"❌ Backend - Failed to upload {img_type} image to S3")
    
    # Update profile fields
    if profile_data.gender is not None:
        user.gender = profile_data.gender
    if profile_data.height is not None:
        user.height = profile_data.height
    if profile_data.weight is not None:
        user.weight = profile_data.weight
    if profile_data.clothing_sizes is not None:
        user.clothing_sizes = profile_data.clothing_sizes
    
    # Mark profile as completed
    user.profile_completed = True
    
    db_commit_start = time.time()
    db.commit()
    db.refresh(user)
    print(f"⏱️ Backend - DB commit took: {(time.time() - db_commit_start)*1000:.0f}ms")
    
    total_time = (time.time() - request_start) * 1000
    print(f"✅ Backend - Request complete! Total: {total_time:.0f}ms")
    
    return user


@router.put("/{user_id}/user-type", response_model=User)
async def update_user_type(
    user_id: int,
    user_type: str = 'individual',
    db: Session = Depends(get_db)
):
    """Update user type (switch between individual and boutique)."""
    from app.models import UserType
    
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
    
    # Update user_type
    user.user_type = UserType.INDIVIDUAL if user_type == 'individual' else UserType.BOUTIQUE
    
    db.commit()
    db.refresh(user)
    
    return user
