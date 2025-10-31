"""Authentication utilities for JWT token handling.

Secure-by-default: verify WorkOS-issued JWTs using JWKS (RS256). Fallback to
the local HMAC token only in development for backwards compatibility.
"""
import jwt
from jwt import PyJWKClient
from datetime import datetime, timedelta
from functools import lru_cache
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import User

WORKOS_JWKS_URL = "https://api.workos.com/user_management/jwks"
bearer_scheme = HTTPBearer(auto_error=True)


def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


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
            options={"verify_aud": True},
        )
        return payload
    except Exception:
        # Fallback only in local/dev
        if settings.ENVIRONMENT.lower() in ("dev", "development", "local"):
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
                return payload
            except Exception as e:
                raise ValueError("Invalid token") from e
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
        sub = payload.get("sub") or payload.get("user_id")
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from e

