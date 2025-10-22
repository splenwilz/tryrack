"""
Database models for TryRack application.
Based on SQLAlchemy official documentation.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """
    User model that integrates with WorkOS authentication.
    Stores additional user data beyond what WorkOS provides.
    """
    __tablename__ = "users"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # WorkOS integration fields
    workos_user_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    
    # Additional user fields
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    # items = relationship("Item", back_populates="owner")


class Item(Base):
    """
    Example item model for demonstration.
    Represents items that users can create and manage.
    """
    __tablename__ = "items"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Item fields
    title = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)
    
    # Foreign key to user
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    # owner = relationship("User", back_populates="items")


class AuditLog(Base):
    """
    Audit log model for tracking user actions.
    Useful for security and compliance.
    """
    __tablename__ = "audit_logs"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Audit fields
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    resource_type = Column(String, nullable=True)
    resource_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    # user = relationship("User")
