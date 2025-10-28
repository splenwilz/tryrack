from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, Enum as SQLEnum, JSON, ForeignKey
from sqlalchemy.sql import func
from app.db import Base
import enum


class UserType(enum.Enum):
    """User type enumeration."""
    INDIVIDUAL = "individual"
    BOUTIQUE = "boutique"


class User(Base):
    """User model with OAuth support."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    
    # Password field - nullable for OAuth users who don't have passwords
    # Based on OAuth best practices where OAuth users don't need local passwords
    hashed_password = Column(String(255), nullable=True)
    
    # OAuth-specific fields
    # Based on WorkOS user profile structure from documentation
    oauth_provider = Column(String(50), nullable=True)  # e.g., "google", "github"
    oauth_provider_id = Column(String(255), nullable=True)  # Provider's user ID
    first_name = Column(String(100), nullable=True)  # From OAuth profile
    last_name = Column(String(100), nullable=True)  # From OAuth profile
    profile_picture_url = Column(String(500), nullable=True)  # Avatar URL from OAuth
    
    # Standard user fields
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # User type for switching between individual and boutique modes
    user_type = Column(SQLEnum(UserType), nullable=True, default=UserType.INDIVIDUAL)
    
    # Profile completion fields
    profile_completed = Column(Boolean, default=False, nullable=False)
    gender = Column(String(10), nullable=True)  # 'male' or 'female'
    height = Column(Float, nullable=True)  # in cm
    weight = Column(Float, nullable=True)  # in kg
    full_body_image_url = Column(String(500), nullable=True)  # For virtual try-on
    
    # Clothing sizes stored as JSON for flexibility
    # Format: {"shoe": "10", "shirt": "M", "jacket": "40", "pants": "32x30"} for male
    # Format: {"shoe": "7", "top": "M", "dress": "8", "pants": "28x30", "bra": "34C"} for female
    clothing_sizes = Column(JSON, nullable=True)


class ItemStatus(enum.Enum):
    """Item status enumeration."""
    CLEAN = "clean"
    WORN = "worn"
    DIRTY = "dirty"


class WardrobeItem(Base):
    """WardrobeItem model for user wardrobe."""
    
    __tablename__ = "wardrobe_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Item details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, index=True)  # top, bottom, shoes, dress, outerwear, accessories, underwear
    colors = Column(JSON, nullable=True)  # Array of color strings
    sizes = Column(JSON, nullable=True)  # Array of size strings
    tags = Column(JSON, nullable=True)  # Array of tag strings
    
    # Image URLs
    image_original = Column(String(500), nullable=True)
    image_clean = Column(String(500), nullable=True)
    
    # Status management
    status = Column(SQLEnum(ItemStatus), nullable=False, default=ItemStatus.CLEAN, index=True)
    
    # Additional metadata
    formality = Column(Float, nullable=True)  # 0.0 to 1.0
    season = Column(JSON, nullable=True)  # Array of season strings
    price = Column(Float, nullable=True)  # Optional price
    
    # Embedding for recommendation engine (future use)
    embedding_id = Column(String(255), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Index for common queries
    __table_args__ = (
        {'comment': 'User wardrobe items for virtual try-on and recommendations'}
    )