"""
Database configuration for PostgreSQL with SQLAlchemy.
Based on official FastAPI and SQLAlchemy documentation.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Database URL from environment variables
# Format: postgresql://username:password@localhost:port/database_name
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:password@localhost:5432/tryrack_db"
)

# Create SQLAlchemy engine
# Reference: https://docs.sqlalchemy.org/en/20/core/engines.html
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,  # Recycle connections every 5 minutes
)

# Create SessionLocal class
# Reference: https://docs.sqlalchemy.org/en/20/orm/session_basics.html
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for declarative models
# Reference: https://docs.sqlalchemy.org/en/20/orm/mapping_styles.html#declarative-mapping
Base = declarative_base()

# Dependency to get database session
def get_db():
    """
    Dependency function to get database session.
    Used with FastAPI's Depends() to inject database sessions into route handlers.
    Reference: https://fastapi.tiangolo.com/tutorial/sql-databases/
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
