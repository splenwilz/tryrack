from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Dict


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a user."""
    password: str


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserInDB(UserBase):
    """Schema for user in database."""
    id: int
    oauth_provider: Optional[str] = None
    oauth_provider_id: Optional[str] = None
    profile_picture_url: Optional[str] = None
    is_active: bool
    is_superuser: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    user_type: Optional[str] = None  # 'individual' or 'boutique'
    profile_completed: Optional[bool] = False
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    full_body_image_url: Optional[str] = None
    clothing_sizes: Optional[Dict[str, str]] = None  # Flexible JSON for gender-specific sizes
    
    class Config:
        from_attributes = True


class User(UserInDB):
    """Schema for user response."""
    pass


class Token(BaseModel):
    """Token schema."""
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """Token payload schema."""
    sub: Optional[int] = None


class ProfileCompletion(BaseModel):
    """Schema for user profile completion."""
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    clothing_sizes: Optional[Dict[str, str]] = None  # {"shoe": "10", "shirt": "M", "pants": "32x30"} etc.
    profile_picture_url: Optional[str] = None
    full_body_image_url: Optional[str] = None
