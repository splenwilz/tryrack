from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

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
    user = get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update profile fields
    if profile_data.gender is not None:
        user.gender = profile_data.gender
    if profile_data.height is not None:
        user.height = profile_data.height
    if profile_data.weight is not None:
        user.weight = profile_data.weight
    if profile_data.shoe_size is not None:
        user.shoe_size = profile_data.shoe_size
    if profile_data.top_size is not None:
        user.top_size = profile_data.top_size
    if profile_data.dress_size is not None:
        user.dress_size = profile_data.dress_size
    if profile_data.pants_size is not None:
        user.pants_size = profile_data.pants_size
    if profile_data.profile_picture_url is not None:
        user.profile_picture_url = profile_data.profile_picture_url
    if profile_data.full_body_image_url is not None:
        user.full_body_image_url = profile_data.full_body_image_url
    
    # Mark profile as completed
    user.profile_completed = True
    
    db.commit()
    db.refresh(user)
    
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
