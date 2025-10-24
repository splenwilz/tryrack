from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from app.db import Base


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
