"""Authentication utilities for JWT token handling.

Secure-by-default: verify WorkOS-issued JWTs using JWKS (RS256). Fallback to
the local HMAC token only in development for backwards compatibility.

Industry standard: Short-lived access tokens (15-60 min) with long-lived 
refresh tokens (7-30 days) following OAuth2 best practices.
"""
import jwt
from jwt import PyJWKClient
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import User, RefreshToken
import secrets
import hashlib

WORKOS_JWKS_URL = "https://api.workos.com/user_management/jwks"
WORKOS_ISSUER = "https://api.workos.com"
bearer_scheme = HTTPBearer(auto_error=True)


def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Create short-lived JWT access token (industry standard: 15-60 minutes).
    
    Access tokens are short-lived to minimize security risk if compromised.
    Use refresh tokens for longer sessions.
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def generate_refresh_token() -> str:
    """Generate a secure random refresh token string."""
    return secrets.token_urlsafe(64)  # 64 bytes = ~86 characters


def hash_refresh_token(token: str) -> str:
    """Hash refresh token for secure database storage (never store plain tokens)."""
    return hashlib.sha256(token.encode()).hexdigest()


def create_refresh_token(db: Session, user_id: int) -> tuple[str, RefreshToken]:
    """
    Create refresh token and store it in database.
    
    Industry standard: Long-lived tokens (7-30 days) used to obtain new access tokens.
    Returns: (plain_token, db_record) - plain token sent to client, hash stored in DB.
    """
    # Generate secure random token
    plain_token = generate_refresh_token()
    hashed_token = hash_refresh_token(plain_token)
    
    # Calculate expiration
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    # Create database record
    refresh_token = RefreshToken(
        user_id=user_id,
        token=hashed_token,  # Store hash, never plain token
        expires_at=expires_at,
        revoked=False
    )
    db.add(refresh_token)
    db.commit()
    db.refresh(refresh_token)
    
    return plain_token, refresh_token


def verify_refresh_token(db: Session, token: str) -> RefreshToken | None:
    """
    Verify refresh token is valid and not revoked/expired.
    
    Returns RefreshToken record if valid, None otherwise.
    """
    hashed_token = hash_refresh_token(token)
    
    refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token == hashed_token,
        RefreshToken.revoked == False,
        RefreshToken.expires_at > datetime.now(timezone.utc)
    ).first()
    
    return refresh_token


def revoke_refresh_token(db: Session, token: str) -> bool:
    """
    Revoke a refresh token (token rotation or logout).
    
    Industry standard: Revoke old token when issuing new one (token rotation).
    """
    hashed_token = hash_refresh_token(token)
    
    refresh_token = db.query(RefreshToken).filter(
        RefreshToken.token == hashed_token
    ).first()
    
    if refresh_token and not refresh_token.revoked:
        refresh_token.revoked = True
        refresh_token.revoked_at = datetime.now(timezone.utc)
        db.commit()
        return True
    
    return False


def revoke_all_user_refresh_tokens(db: Session, user_id: int) -> int:
    """
    Revoke all refresh tokens for a user (logout from all devices).
    
    Returns number of tokens revoked.
    """
    tokens = db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked == False
    ).all()
    
    revoked_count = 0
    for token in tokens:
        token.revoked = True
        token.revoked_at = datetime.now(timezone.utc)
        revoked_count += 1
    
    db.commit()
    return revoked_count


def verify_token(token: str):
    """Verify and decode token.

    Priority: WorkOS (RS256 via JWKS). Dev fallback: local HMAC.
    """
    # Try WorkOS verification first (RS256)
    try:
        jwks_client = _get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=settings.WORKOS_CLIENT_ID,
            issuer=WORKOS_ISSUER,
            options={"verify_aud": True, "verify_iss": True},
        )
        return payload
    except jwt.PyJWTError:
        # Fallback only in local/dev
        if settings.ENVIRONMENT.lower() in ("dev", "development", "local"):
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                return payload
            except jwt.PyJWTError:
                # Make it explicit that HMAC fallback failed for auth, not system
                raise ValueError("Invalid token") from None
        raise ValueError("Invalid token")


@lru_cache(maxsize=1)
def _get_jwks_client() -> PyJWKClient:
    return PyJWKClient(WORKOS_JWKS_URL)


def get_current_user_id(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> int:
    """FastAPI dependency: returns authenticated user's id.

    Expects a WorkOS access token in Authorization: Bearer <token>.
    """
    token = creds.credentials
    try:
        payload = verify_token(token)
        # WorkOS tokens: sub is a string like "user_01...". Dev tokens may set numeric sub.
        sub = payload.get("sub")
        if sub is None:
            raise ValueError("Missing subject in token")

        # If numeric-like, allow direct cast (dev/HMAC tokens)
        try:
            return int(sub)
        except (TypeError, ValueError):
            pass

        # Otherwise, map WorkOS user id -> our internal user via oauth_provider_id
        user = db.query(User).filter(User.oauth_provider_id == str(sub)).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authenticated user not found",
            )
        return user.id
    except ValueError as e:
        # Authentication failure (bad/expired token)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e) or "Invalid or expired token",
        ) from e
    except HTTPException:
        raise
    except Exception as e:
        # Unexpected system error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication system error",
        ) from e

