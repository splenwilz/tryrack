from sqlalchemy.orm import Session
from typing import Optional, List
from passlib.context import CryptContext

from app.models import User, WardrobeItem, ItemStatus
from app.schemas import UserCreate, UserUpdate, WardrobeItemCreate, WardrobeItemUpdate

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash using Argon2."""
    return pwd_context.hash(password)


def get_user(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID."""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email."""
    return db.query(User).filter(User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Get all users with pagination."""
    return db.query(User).offset(skip).limit(limit).all()


def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user."""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user: User, user_update: UserUpdate) -> User:
    """Update user."""
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    """Delete user."""
    db.delete(user)
    db.commit()


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user."""
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


# Wardrobe service functions
def get_wardrobe_items(db: Session, user_id: int, skip: int = 0, limit: int = 100, category: Optional[str] = None, status: Optional[str] = None) -> List[WardrobeItem]:
    """Get wardrobe items for a user with optional filters."""
    query = db.query(WardrobeItem).filter(WardrobeItem.user_id == user_id)
    
    if category:
        query = query.filter(WardrobeItem.category == category)
    
    if status:
        # Convert lowercase status to uppercase enum
        status_upper = status.upper()
        if status_upper == "CLEAN":
            query = query.filter(WardrobeItem.status == ItemStatus.CLEAN)
        elif status_upper == "WORN":
            query = query.filter(WardrobeItem.status == ItemStatus.WORN)
        elif status_upper == "DIRTY":
            query = query.filter(WardrobeItem.status == ItemStatus.DIRTY)
    
    return query.offset(skip).limit(limit).all()


def get_wardrobe_item(db: Session, item_id: int, user_id: int) -> Optional[WardrobeItem]:
    """Get a specific wardrobe item by ID for a user."""
    return db.query(WardrobeItem).filter(
        WardrobeItem.id == item_id,
        WardrobeItem.user_id == user_id
    ).first()


def create_wardrobe_item(db: Session, item: WardrobeItemCreate, user_id: int) -> WardrobeItem:
    """Create a new wardrobe item."""
    db_item = WardrobeItem(
        user_id=user_id,
        title=item.title,
        description=item.description,
        category=item.category,
        colors=item.colors,
        sizes=item.sizes,
        tags=item.tags,
        price=item.price,
        formality=item.formality,
        season=item.season,
        image_original=item.image_original,
        image_clean=item.image_clean,
        status=ItemStatus.CLEAN,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_wardrobe_item(db: Session, item: WardrobeItem, item_update: WardrobeItemUpdate) -> WardrobeItem:
    """Update a wardrobe item."""
    update_data = item_update.model_dump(exclude_unset=True)
    
    # Handle status enum conversion
    if "status" in update_data:
        status_str = update_data["status"]
        if status_str == "clean":
            update_data["status"] = ItemStatus.CLEAN
        elif status_str == "worn":
            update_data["status"] = ItemStatus.WORN
        elif status_str == "dirty":
            update_data["status"] = ItemStatus.DIRTY
    
    for field, value in update_data.items():
        setattr(item, field, value)
    
    db.commit()
    db.refresh(item)
    return item


def update_wardrobe_item_status(db: Session, item: WardrobeItem, status: str) -> WardrobeItem:
    """Update wardrobe item status."""
    status_upper = status.upper()
    if status_upper == "CLEAN":
        item.status = ItemStatus.CLEAN
    elif status_upper == "WORN":
        item.status = ItemStatus.WORN
    elif status_upper == "DIRTY":
        item.status = ItemStatus.DIRTY
    else:
        raise ValueError(f"Invalid status: {status}")
    
    db.commit()
    db.refresh(item)
    return item


def delete_wardrobe_item(db: Session, item: WardrobeItem) -> None:
    """Delete a wardrobe item."""
    db.delete(item)
    db.commit()
