from fastapi import APIRouter, HTTPException, status, Query, Depends
from fastapi.responses import RedirectResponse
from typing import Optional
import secrets
import base64
from sqlalchemy.orm import Session

from app.core.workos import workos_client
from app.core.config import settings
from app.core.auth import create_refresh_token
from app.services import get_user_by_email, create_user
from app.db import get_db
from app.schemas import UserCreate
from app.utils import create_access_token

router = APIRouter(prefix="/auth/oauth", tags=["oauth"])


@router.get("/google")
async def initiate_google_oauth():
    """
    Initiate Google OAuth flow.
    
    Based on WorkOS Python SDK documentation:
    - workos.user_management.get_authorization_url() generates OAuth URL
    - provider="GoogleOAuth" specifies Google as the OAuth provider
    - redirect_uri must match WorkOS configuration
    """
    try:
        # Debug: Log WorkOS configuration
        print(f"🔍 OAuth Debug - WorkOS Client ID: {settings.WORKOS_CLIENT_ID}")
        print(f"🔍 OAuth Debug - WorkOS Redirect URI: {settings.WORKOS_REDIRECT_URI}")
        
        # Generate a random state parameter for security
        # Based on OAuth 2.0 security best practices
        state = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8')
        print(f"🔍 OAuth Debug - Generated state: {state}")
        
        # Get authorization URL from WorkOS
        # Documentation: https://workos.com/docs/authkit/react/python/2-add-authkit-to-your-app/add-a-callback-endpoint
        authorization_url = workos_client.user_management.get_authorization_url(
            provider="GoogleOAuth",
            redirect_uri=settings.WORKOS_REDIRECT_URI,
            state=state
        )
        
        print(f"🔍 OAuth Debug - Generated authorization URL: {authorization_url}")
        
        return {"authorization_url": authorization_url, "state": state}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate OAuth: {str(e)}"
        )


@router.get("/apple")
async def initiate_apple_oauth():
    """
    Initiate Apple OAuth flow.
    
    Based on WorkOS Python SDK documentation:
    - workos.user_management.get_authorization_url() generates OAuth URL
    - provider="AppleOAuth" specifies Apple as the OAuth provider
    - redirect_uri must match WorkOS configuration
    - Apple Sign-In requires specific configuration in WorkOS dashboard
    """
    try:
        # Debug: Log WorkOS configuration
        print(f"🔍 Apple OAuth Debug - WorkOS Client ID: {settings.WORKOS_CLIENT_ID}")
        print(f"🔍 Apple OAuth Debug - WorkOS Redirect URI: {settings.WORKOS_REDIRECT_URI}")
        
        # Generate a random state parameter for security
        # Based on OAuth 2.0 security best practices and Apple's requirements
        state = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8')
        print(f"🔍 Apple OAuth Debug - Generated state: {state}")
        
        # Get authorization URL from WorkOS for Apple OAuth
        # Documentation: https://workos.com/docs/authkit/react/python/2-add-authkit-to-your-app/add-a-callback-endpoint
        # Apple OAuth provider must be configured in WorkOS dashboard
        authorization_url = workos_client.user_management.get_authorization_url(
            provider="AppleOAuth",
            redirect_uri=settings.WORKOS_REDIRECT_URI,
            state=state
        )
        
        print(f"🔍 Apple OAuth Debug - Generated authorization URL: {authorization_url}")
        
        return {"authorization_url": authorization_url, "state": state}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate Apple OAuth: {str(e)}"
        )


@router.get("/callback")
async def oauth_callback(
    code: str = Query(..., description="Authorization code from OAuth provider"),
    state: Optional[str] = Query(None, description="State parameter for security"),
    db: Session = Depends(get_db)
):
    """
    Handle OAuth callback from mobile app.
    
    This endpoint receives the authorization code from the mobile app
    and exchanges it with WorkOS for user information.
    
    Based on WorkOS Python SDK documentation:
    - workos.user_management.authenticate_with_code() exchanges code for user info
    - Returns user profile information from OAuth provider (Google, Apple, etc.)
    - Supports multiple OAuth providers through WorkOS
    """
    try:
        print(f"🔍 OAuth Debug - Received code: {code}")
        print(f"🔍 OAuth Debug - Received state: {state}")
        
        # Authenticate with WorkOS using the authorization code
        # Documentation: https://workos.com/docs/authkit/react/python/2-add-authkit-to-your-app/add-a-callback-endpoint
        auth_response = workos_client.user_management.authenticate_with_code(
            code=code
        )
        
        print(f"🔍 OAuth Debug - WorkOS auth response: {auth_response}")
        
        # Extract user information from WorkOS response
        # Based on WorkOS API documentation: authenticate_with_code returns {user: {...}}
        user_email = auth_response.user.email
        user_first_name = auth_response.user.first_name
        user_last_name = auth_response.user.last_name
        user_profile_picture = getattr(auth_response.user, 'picture', None)
        
        # Determine OAuth provider from WorkOS response
        # Based on WorkOS API documentation: provider information is available in the response
        # We need to map WorkOS provider names to our internal provider names
        oauth_provider = "google"  # Default fallback
        if hasattr(auth_response, 'provider') and auth_response.provider:
            if auth_response.provider == "GoogleOAuth":
                oauth_provider = "google"
            elif auth_response.provider == "AppleOAuth":
                oauth_provider = "apple"
            else:
                # Handle other providers as needed
                oauth_provider = auth_response.provider.lower().replace("oauth", "")
        
        print(f"🔍 OAuth Debug - Detected provider: {oauth_provider}")
        
        # Check if user already exists in our database
        existing_user = get_user_by_email(db, email=user_email)
        
        if existing_user:
            # User exists, update OAuth information if needed
            user = existing_user
            if not user.oauth_provider:
                user.oauth_provider = oauth_provider
                user.oauth_provider_id = auth_response.user.id
                user.first_name = user_first_name
                user.last_name = user_last_name
                user.profile_picture_url = user_profile_picture
                db.commit()
                db.refresh(user)
        else:
            # Create new user from OAuth data
            # Generate a random password since OAuth users don't have passwords
            random_password = secrets.token_urlsafe(32)
            
            user_data = UserCreate(
                email=user_email,
                username=user_email.split('@')[0],  # Use email prefix as username
                password=random_password,
                first_name=user_first_name,
                last_name=user_last_name
            )
            
            user = create_user(db=db, user=user_data)
            
            # Update OAuth-specific fields after user creation
            user.oauth_provider = oauth_provider
            user.oauth_provider_id = auth_response.user.id
            user.profile_picture_url = user_profile_picture
            user.hashed_password = None  # OAuth users don't need passwords
            db.commit()
            db.refresh(user)
        
        # Create JWT access token (short-lived) and refresh token (long-lived)
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token_str, _ = create_refresh_token(db, user.id)
        
        # For mobile app, we'll return the token in the response
        # The frontend will handle storing the token
        return {
            "access_token": access_token,
            "refresh_token": refresh_token_str,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "profile_picture_url": user.profile_picture_url,
                "is_active": user.is_active
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OAuth authentication failed: {str(e)}"
        )
