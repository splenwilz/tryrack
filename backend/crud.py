"""
CRUD operations for database models.
Based on FastAPI official documentation patterns.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, List
from datetime import datetime
import models
import schemas


# User CRUD operations
def get_user(db: Session, user_id: int) -> Optional[models.User]:
    """Get user by ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_workos_id(db: Session, workos_user_id: str) -> Optional[models.User]:
    """Get user by WorkOS user ID."""
    return db.query(models.User).filter(models.User.workos_user_id == workos_user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Get user by email."""
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """Create a new user."""
    db_user = models.User(
        workos_user_id=user.workos_user_id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate) -> Optional[models.User]:
    """Update user information."""
    db_user = get_user(db, user_id)
    if db_user:
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        db.commit()
        db.refresh(db_user)
    return db_user


def update_user_last_login(db: Session, user_id: int) -> Optional[models.User]:
    """Update user's last login timestamp."""
    db_user = get_user(db, user_id)
    if db_user:
        db_user.last_login_at = datetime.utcnow()
        db.commit()
        db.refresh(db_user)
    return db_user


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    """Get list of users with pagination."""
    return db.query(models.User).offset(skip).limit(limit).all()


# Item CRUD operations
def get_item(db: Session, item_id: int) -> Optional[models.Item]:
    """Get item by ID."""
    return db.query(models.Item).filter(models.Item.id == item_id).first()


def get_items_by_owner(db: Session, owner_id: int, skip: int = 0, limit: int = 100) -> List[models.Item]:
    """Get items by owner with pagination."""
    return db.query(models.Item).filter(models.Item.owner_id == owner_id).offset(skip).limit(limit).all()


def create_item(db: Session, item: schemas.ItemCreate, owner_id: int) -> models.Item:
    """Create a new item."""
    db_item = models.Item(
        title=item.title,
        description=item.description,
        owner_id=owner_id
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_item(db: Session, item_id: int, item_update: schemas.ItemUpdate) -> Optional[models.Item]:
    """Update item information."""
    db_item = get_item(db, item_id)
    if db_item:
        update_data = item_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        db.commit()
        db.refresh(db_item)
    return db_item


def delete_item(db: Session, item_id: int) -> bool:
    """Delete an item."""
    db_item = get_item(db, item_id)
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False


# Audit log CRUD operations
def create_audit_log(db: Session, audit_log: schemas.AuditLogCreate) -> models.AuditLog:
    """Create a new audit log entry."""
    db_audit_log = models.AuditLog(
        user_id=audit_log.user_id,
        action=audit_log.action,
        resource_type=audit_log.resource_type,
        resource_id=audit_log.resource_id,
        details=audit_log.details,
        ip_address=audit_log.ip_address,
        user_agent=audit_log.user_agent
    )
    db.add(db_audit_log)
    db.commit()
    db.refresh(db_audit_log)
    return db_audit_log


def get_audit_logs_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[models.AuditLog]:
    """Get audit logs for a specific user."""
    return db.query(models.AuditLog).filter(models.AuditLog.user_id == user_id).offset(skip).limit(limit).all()


def get_audit_logs(db: Session, skip: int = 0, limit: int = 100) -> List[models.AuditLog]:
    """Get all audit logs with pagination."""
    return db.query(models.AuditLog).offset(skip).limit(limit).all()
