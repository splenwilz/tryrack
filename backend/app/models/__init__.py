from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, Enum as SQLEnum, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.types import Enum as SQLAlchemyEnum
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
    
    # Relationships
    virtual_tryons = relationship("VirtualTryOnResult", back_populates="user", cascade="all, delete-orphan")


class ItemStatus(enum.Enum):
    """Item status enumeration."""
    CLEAN = "clean"
    WORN = "worn"
    DIRTY = "dirty"


class ProcessingStatus(enum.Enum):
    """AI processing status enumeration."""
    PENDING = "pending"  # Just uploaded, waiting for Gemini
    PROCESSING = "processing"  # Gemini is working on it
    COMPLETED = "completed"  # Gemini finished successfully
    FAILED = "failed"  # Gemini processing failed


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
    status = Column(
        SQLEnum(ItemStatus, name="itemstatus", native_enum=True),
        nullable=False,
        server_default=ItemStatus.CLEAN.value,
        index=True,
    )
    
    # 🤖 AI Processing status
    processing_status = Column(
        SQLEnum(ProcessingStatus, name="processingstatus", native_enum=True),
        nullable=False,
        server_default=ProcessingStatus.PENDING.value,
        index=True,
    )
    
    # 🤖 AI-suggested metadata (JSON structure from Gemini)
    ai_suggestions = Column(JSON, nullable=True)  # {title, category, colors, tags}
    
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


# Virtual Try-On Status Enum
class VirtualTryOnStatus(enum.Enum):
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# Virtual Try-On Results Model
class VirtualTryOnResult(Base):
    """
    Stores virtual try-on results generated by Gemini AI.
    Users can virtually try on wardrobe or boutique items on their photos.
    """
    __tablename__ = 'virtual_tryon_results'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Item information
    item_type = Column(String(20), nullable=False)  # 'wardrobe' or 'boutique'
    item_id = Column(String(50), nullable=False)  # ID of the item being tried on
    
    # Image URLs
    user_image_url = Column(String(500), nullable=False)  # User's photo
    item_image_url = Column(String(500), nullable=False)  # Item image
    result_image_url = Column(String(500), nullable=True)  # Generated result
    
    # Processing status
    status = Column(SQLAlchemyEnum(VirtualTryOnStatus, values_callable=lambda x: [e.value for e in x]), default=VirtualTryOnStatus.PROCESSING, nullable=False, index=True)
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    user = relationship("User", back_populates="virtual_tryons")
    
    __table_args__ = (
        {'comment': 'Virtual try-on results generated by AI'}
    )