from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional, Dict, List, Any


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
    
    model_config = ConfigDict(from_attributes=True)


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


# Wardrobe schemas
class WardrobeItemBase(BaseModel):
    """Base wardrobe item schema."""
    title: str
    description: Optional[str] = None
    category: str  # top, bottom, shoes, dress, outerwear, accessories, underwear
    colors: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    price: Optional[float] = None
    formality: Optional[float] = None
    season: Optional[List[str]] = None


class WardrobeItemCreate(WardrobeItemBase):
    """Schema for creating a wardrobe item."""
    image_original: Optional[str] = None
    image_clean: Optional[str] = None


class WardrobeItemUpdate(BaseModel):
    """Schema for updating a wardrobe item."""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    colors: Optional[List[str]] = None
    sizes: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    price: Optional[float] = None
    formality: Optional[float] = None
    season: Optional[List[str]] = None
    image_original: Optional[str] = None
    image_clean: Optional[str] = None
    status: Optional[str] = None  # 'clean', 'worn', 'dirty'


class WardrobeItemResponse(WardrobeItemBase):
    """Schema for wardrobe item response."""
    id: int
    user_id: int
    processing_status: str  # 🤖 'pending', 'processing', 'completed', 'failed'
    ai_suggestions: Optional[Dict[str, Any]] = None  # 🤖 AI-suggested metadata
    image_original: Optional[str] = None
    image_clean: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class WardrobeItemStatusUpdate(BaseModel):
    """Schema for updating wardrobe item status."""
    status: str  # 'clean', 'worn', 'dirty'


# ===== Virtual Try-On Schemas =====

class ItemDetails(BaseModel):
    """Item details for virtual try-on context."""
    category: str
    colors: List[str]
    type: str  # 'wardrobe' or 'boutique'


class VirtualTryOnRequest(BaseModel):
    """Request schema for generating virtual try-on."""
    user_image_url: Optional[str] = None  # Prefer URL; fallback to base64
    item_image_url: Optional[str] = None  # Prefer URL; fallback to base64
    # Allow freshly captured images without first uploading
    user_image_base64: Optional[str] = None
    item_image_base64: Optional[str] = None
    item_details: ItemDetails
    use_clean_background: bool = False  # Default: keep original background


class VirtualTryOnResponse(BaseModel):
    """Response schema for virtual try-on result."""
    id: int
    user_id: int
    item_type: str
    item_id: str
    user_image_url: str
    item_image_url: str
    result_image_url: Optional[str] = None
    result_image_base64: Optional[str] = None
    status: str  # 'processing', 'completed', 'failed'
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class VirtualTryOnCreate(BaseModel):
    """Internal schema for creating virtual try-on record."""
    user_id: int
    item_type: str
    item_id: str
    user_image_url: str
    item_image_url: str