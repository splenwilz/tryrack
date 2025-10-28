from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Dict, List


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
    image_original: Optional[str] = None
    image_clean: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
    
    @staticmethod
    def get_json_encoders():
        """Custom JSON encoder to convert enum to lowercase string."""
        return {
            type: lambda v: v.value.lower() if hasattr(v, 'value') else str(v).lower()
        }


class WardrobeItemStatusUpdate(BaseModel):
    """Schema for updating wardrobe item status."""
    status: str  # 'clean', 'worn', 'dirty'