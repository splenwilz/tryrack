"""
API endpoints for database operations.
Based on FastAPI official documentation patterns.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import crud
import models
import schemas
from database import get_db
from auth import get_current_user

# Create router for database operations
router = APIRouter()


# User endpoints
@router.get("/users/me", response_model=schemas.User)
async def get_current_user_info(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user information from database.
    This extends the WorkOS user data with our local database information.
    """
    return current_user


@router.put("/users/me", response_model=schemas.User)
async def update_current_user(
    user_update: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user information.
    """
    updated_user = crud.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return updated_user


# Item endpoints
@router.get("/items/", response_model=List[schemas.Item])
async def get_user_items(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's items with pagination.
    """
    items = crud.get_items_by_owner(db, current_user.id, skip=skip, limit=limit)
    return items


@router.post("/items/", response_model=schemas.Item)
async def create_item(
    item: schemas.ItemCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new item for the current user.
    """
    return crud.create_item(db, item, current_user.id)


@router.get("/items/{item_id}", response_model=schemas.Item)
async def get_item(
    item_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific item by ID (only if owned by current user).
    """
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    if item.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return item


@router.put("/items/{item_id}", response_model=schemas.Item)
async def update_item(
    item_id: int,
    item_update: schemas.ItemUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a specific item (only if owned by current user).
    """
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    if item.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_item = crud.update_item(db, item_id, item_update)
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return updated_item


@router.delete("/items/{item_id}", response_model=schemas.MessageResponse)
async def delete_item(
    item_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a specific item (only if owned by current user).
    """
    item = crud.get_item(db, item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    if item.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    success = crud.delete_item(db, item_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    return schemas.MessageResponse(message="Item deleted successfully")


# Audit log endpoints (admin only)
@router.get("/audit-logs/", response_model=List[schemas.AuditLog])
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get audit logs for the current user.
    """
    audit_logs = crud.get_audit_logs_by_user(db, current_user.id, skip=skip, limit=limit)
    return audit_logs
