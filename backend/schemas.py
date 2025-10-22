"""
Pydantic schemas for API request/response models.
Based on FastAPI official documentation.
"""

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List


# User schemas
class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a new user."""
    workos_user_id: str


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None


class User(UserBase):
    """Schema for user response."""
    id: int
    workos_user_id: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Item schemas
class ItemBase(BaseModel):
    """Base item schema with common fields."""
    title: str
    description: Optional[str] = None


class ItemCreate(ItemBase):
    """Schema for creating a new item."""
    pass


class ItemUpdate(BaseModel):
    """Schema for updating an item."""
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None


class Item(ItemBase):
    """Schema for item response."""
    id: int
    is_completed: bool
    owner_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ItemWithOwner(Item):
    """Schema for item response with owner information."""
    owner: User


# Audit log schemas
class AuditLogBase(BaseModel):
    """Base audit log schema."""
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    """Schema for creating an audit log entry."""
    user_id: Optional[int] = None


class AuditLog(AuditLogBase):
    """Schema for audit log response."""
    id: int
    user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Response schemas
class MessageResponse(BaseModel):
    """Generic message response schema."""
    message: str


class PaginatedResponse(BaseModel):
    """Generic paginated response schema."""
    items: List[dict]
    total: int
    page: int
    size: int
    pages: int
