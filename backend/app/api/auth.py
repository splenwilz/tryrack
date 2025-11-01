from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import Optional
import secrets

from app.core.workos import workos_client
from app.core.config import settings
from app.core.auth import create_refresh_token, verify_refresh_token, revoke_refresh_token
from app.services import get_user_by_email, create_user
from app.db import get_db
from app.schemas import UserCreate
from app.utils import create_access_token
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/auth", tags=["auth"])


class SignUpRequest(BaseModel):
    """Sign up request model."""
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class SignInRequest(BaseModel):
    """Sign in request model."""
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Authentication response model with refresh token (OAuth2 standard)."""
    access_token: str
    refresh_token: str  # Long-lived token for refreshing access tokens
    token_type: str = "bearer"
    user: dict


class EmailVerificationResponse(BaseModel):
    """Email verification response model."""
    message: str
    pending_authentication_token: Optional[str] = None
    email: Optional[str] = None


class VerifyEmailRequest(BaseModel):
    """Email verification request model."""
    pending_authentication_token: str
    code: str


class RefreshTokenRequest(BaseModel):
    """Refresh token request model (OAuth2 standard)."""
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    """Refresh token response model (OAuth2 standard with token rotation)."""
    access_token: str
    refresh_token: str  # New refresh token (token rotation)
    token_type: str = "bearer"


@router.post("/signup")
async def sign_up(
    request: SignUpRequest,
    db: Session = Depends(get_db)
):
    """
    Sign up with email and password using WorkOS.
    
    Based on WorkOS Python SDK documentation:
    - workos.user_management.create_user() creates a new user
    - If email verification is required, returns verification details
    - Password is handled securely by WorkOS
    """
    try:
        print(f"🔍 Sign Up Debug - Email: {request.email}")
        print(f"🔍 Sign Up Debug - First Name: {request.first_name}")
        print(f"🔍 Sign Up Debug - Last Name: {request.last_name}")
        
        # Check if user already exists in our database
        existing_user = get_user_by_email(db, email=request.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create user in WorkOS
        # Documentation: https://workos.com/docs/user-management/create-user
        # WorkOS handles password hashing and security
        workos_user = workos_client.user_management.create_user(
            email=request.email,
            password=request.password,
            first_name=request.first_name,
            last_name=request.last_name
        )
        
        print(f"🔍 Sign Up Debug - WorkOS user created: {workos_user}")
        print(f"🔍 Sign Up Debug - WorkOS user type: {type(workos_user)}")
        print(f"🔍 Sign Up Debug - WorkOS user attributes: {dir(workos_user)}")
        
        # Check if email verification is required
        # Based on WorkOS documentation: create_user may return verification details
        # Let's check multiple possible attributes for verification requirement
        verification_required = False
        pending_token = None
        
        # Check various possible attributes that might indicate verification is required
        if hasattr(workos_user, 'email_verification_required'):
            verification_required = workos_user.email_verification_required
            print(f"🔍 Sign Up Debug - email_verification_required: {verification_required}")
        
        if hasattr(workos_user, 'pending_authentication_token'):
            pending_token = workos_user.pending_authentication_token
            print(f"🔍 Sign Up Debug - pending_authentication_token: {pending_token}")
        
        # Also check if the user object has verification-related attributes
        if hasattr(workos_user, 'verification_required'):
            verification_required = workos_user.verification_required
            print(f"🔍 Sign Up Debug - verification_required: {verification_required}")
        
        # Check if there's a verification status
        if hasattr(workos_user, 'email_verified'):
            email_verified = workos_user.email_verified
            print(f"🔍 Sign Up Debug - email_verified: {email_verified}")
            if not email_verified:
                verification_required = True
        
        # TEMPORARY: Force verification for testing
        # Remove this after confirming WorkOS configuration
        if request.email.endswith('@test.com') or request.email.endswith('@example.com'):
            print(f"🔍 Sign Up Debug - Forcing verification for test email")
            return EmailVerificationResponse(
                message="Email verification required. Please check your email for a verification code.",
                pending_authentication_token="test_token_12345",
                email=request.email
            )
        
        if verification_required:
            print(f"🔍 Sign Up Debug - Email verification required")
            return EmailVerificationResponse(
                message="Email verification required. Please check your email for a verification code.",
                pending_authentication_token=pending_token,
                email=request.email
            )
        
        # If no verification required, proceed with normal flow
        # Create user in our local database
        random_password = secrets.token_urlsafe(32)
        
        user_data = UserCreate(
            email=request.email,
            username=request.email.split('@')[0],  # Use email prefix as username
            password=random_password,
            first_name=request.first_name,
            last_name=request.last_name
        )
        
        user = create_user(db=db, user=user_data)
        
        # Update user with WorkOS information
        user.oauth_provider = "workos"
        user.oauth_provider_id = workos_user.id
        user.hashed_password = None  # WorkOS users don't need local passwords
        db.commit()
        db.refresh(user)
        
        # Create JWT access token (short-lived) and refresh token (long-lived)
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token_str, _ = create_refresh_token(db, user.id)
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token_str,
            token_type="bearer",
            user={
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "profile_picture_url": user.profile_picture_url,
                "is_active": user.is_active
            }
        )
        
    except Exception as e:
        print(f"❌ Sign Up Error: {str(e)}")
        print(f"❌ Sign Up Error Type: {type(e)}")
        print(f"❌ Sign Up Error Args: {e.args}")
        
        # Check if this is an email verification error from WorkOS
        error_str = str(e).lower()
        print(f"❌ Sign Up Error String: {error_str}")
        
        if 'email_verification' in error_str or 'verification' in error_str or 'verify' in error_str:
            print(f"🔍 Sign Up Debug - Detected verification error, returning verification response")
            return EmailVerificationResponse(
                message="Email verification required. Please check your email for a verification code.",
                email=request.email
            )
        
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sign up failed: {str(e)}"
        )


@router.post("/signin", response_model=AuthResponse)
async def sign_in(
    request: SignInRequest,
    db: Session = Depends(get_db)
):
    """
    Sign in with email and password using WorkOS.
    
    Based on WorkOS Python SDK documentation:
    - workos.user_management.authenticate_with_password() authenticates user
    - Returns user information and access token
    - Handles password verification securely
    """
    try:
        print(f"🔍 Sign In Debug - Email: {request.email}")
        
        # Authenticate with WorkOS using email and password
        # Documentation: https://workos.com/docs/user-management/authenticate-with-password
        # WorkOS handles password verification securely
        auth_response = workos_client.user_management.authenticate_with_password(
            email=request.email,
            password=request.password
        )
        
        print(f"🔍 Sign In Debug - WorkOS auth response: {auth_response}")
        
        # Get user from our local database
        user = get_user_by_email(db, email=request.email)
        if not user:
            # If user doesn't exist locally but exists in WorkOS, create them
            # This handles cases where user was created directly in WorkOS dashboard
            random_password = secrets.token_urlsafe(32)
            
            user_data = UserCreate(
                email=request.email,
                username=request.email.split('@')[0],
                password=random_password,
                first_name=getattr(auth_response.user, 'first_name', None),
                last_name=getattr(auth_response.user, 'last_name', None)
            )
            
            user = create_user(db=db, user=user_data)
            
            # Update user with WorkOS information
            user.oauth_provider = "workos"
            user.oauth_provider_id = auth_response.user.id
            user.hashed_password = None
            db.commit()
            db.refresh(user)
        
        # Create JWT access token for the user
        # Based on our existing JWT implementation
        access_token = create_access_token(data={"sub": str(user.id)})
        
        return AuthResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "profile_picture_url": user.profile_picture_url,
                "is_active": user.is_active
            }
        )
        
    except Exception as e:
        print(f"❌ Sign In Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )


@router.post("/reset-password")
async def reset_password(
    request: SignInRequest,  # Reusing for email only
    db: Session = Depends(get_db)
):
    """
    Reset password using WorkOS.
    
    Based on WorkOS Python SDK documentation:
    - workos.user_management.send_password_reset_email() sends reset email
    - User receives email with reset link
    """
    try:
        print(f"🔍 Reset Password Debug - Email: {request.email}")
        
        # Send password reset email via WorkOS
        # Documentation: https://workos.com/docs/user-management/send-password-reset-email
        # WorkOS handles the email sending and reset flow
        workos_client.user_management.send_password_reset_email(
            email=request.email
        )
        
        print(f"🔍 Reset Password Debug - Reset email sent successfully")
        
        return {"message": "Password reset email sent successfully"}
        
    except Exception as e:
        print(f"❌ Reset Password Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to send reset email: {str(e)}"
        )


@router.post("/verify-email", response_model=AuthResponse)
async def verify_email(
    request: VerifyEmailRequest,
    db: Session = Depends(get_db)
):
    """
    Verify email with verification code using WorkOS.
    
    Based on WorkOS Python SDK documentation:
    - workos.user_management.verify_email() verifies the code
    - Completes the authentication process after verification
    - Returns user information and access token
    """
    try:
        print(f"🔍 Email Verification Debug - Code: {request.code}")
        print(f"🔍 Email Verification Debug - Token: {request.pending_authentication_token}")
        
        # TEMPORARY: Handle test token for debugging
        # Remove this after confirming WorkOS configuration
        if request.pending_authentication_token == "test_token_12345":
            print(f"🔍 Email Verification Debug - Using test token, creating mock user")
            # Create a mock user for testing
            random_password = secrets.token_urlsafe(32)
            
            user_data = UserCreate(
                email="test@example.com",  # This should come from the sign-up request
                username="test",
                password=random_password,
                first_name="Test",
                last_name="User"
            )
            
            user = create_user(db=db, user=user_data)
            
            # Update user with test information
            user.oauth_provider = "workos"
            user.oauth_provider_id = "test_workos_id"
            user.hashed_password = None
            db.commit()
            db.refresh(user)
            
            # Create JWT access token for the user
            access_token = create_access_token(data={"sub": str(user.id)})
            
            return AuthResponse(
                access_token=access_token,
                token_type="bearer",
                user={
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "profile_picture_url": user.profile_picture_url,
                    "is_active": user.is_active
                }
            )
        
        # Verify email with WorkOS using the code
        # Documentation: https://workos.com/docs/user-management/verify-email
        # WorkOS handles code validation and completes authentication
        auth_response = workos_client.user_management.verify_email(
            pending_authentication_token=request.pending_authentication_token,
            code=request.code
        )
        
        print(f"🔍 Email Verification Debug - WorkOS verification response: {auth_response}")
        
        # Extract user information from WorkOS response
        user_email = auth_response.user.email
        user_first_name = getattr(auth_response.user, 'first_name', None)
        user_last_name = getattr(auth_response.user, 'last_name', None)
        
        # Create user in our local database
        random_password = secrets.token_urlsafe(32)
        
        user_data = UserCreate(
            email=user_email,
            username=user_email.split('@')[0],  # Use email prefix as username
            password=random_password,
            first_name=user_first_name,
            last_name=user_last_name
        )
        
        user = create_user(db=db, user=user_data)
        
        # Update user with WorkOS information
        user.oauth_provider = "workos"
        user.oauth_provider_id = auth_response.user.id
        user.hashed_password = None  # WorkOS users don't need local passwords
        db.commit()
        db.refresh(user)
        
        # Create JWT access token (short-lived) and refresh token (long-lived)
        access_token = create_access_token(data={"sub": str(user.id)})
        refresh_token_str, _ = create_refresh_token(db, user.id)
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token_str,
            token_type="bearer",
            user={
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "profile_picture_url": user.profile_picture_url,
                "is_active": user.is_active
            }
        )
        
    except Exception as e:
        print(f"❌ Email Verification Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email verification failed: {str(e)}"
        )


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token (OAuth2 standard).
    
    Industry best practices:
    - Token rotation: New refresh token issued, old one revoked
    - Short-lived access tokens (15 minutes) + long-lived refresh tokens (7 days)
    - Secure: Refresh tokens stored hashed in database
    
    Returns new access_token and refresh_token (token rotation).
    """
    print("🔄 Token Refresh Debug - Refresh endpoint called")
    print(f"🔄 Token Refresh Debug - Received refresh token (length: {len(request.refresh_token)})")
    
    # Verify refresh token is valid and not revoked/expired
    refresh_token_record = verify_refresh_token(db, request.refresh_token)
    
    if not refresh_token_record:
        print("❌ Token Refresh Debug - Invalid or expired refresh token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    print(f"✅ Token Refresh Debug - Refresh token valid for user_id: {refresh_token_record.user_id}")
    print(f"🔄 Token Refresh Debug - Revoking old refresh token (token rotation)")
    
    # Revoke old refresh token (token rotation for security)
    revoke_refresh_token(db, request.refresh_token)
    
    print("🔄 Token Refresh Debug - Creating new access token...")
    # Create new access token
    access_token = create_access_token(data={"sub": str(refresh_token_record.user_id)})
    
    print("🔄 Token Refresh Debug - Creating new refresh token (token rotation)...")
    # Create new refresh token (token rotation)
    new_refresh_token_str, _ = create_refresh_token(db, refresh_token_record.user_id)
    
    print("✅ Token Refresh Debug - Token refresh successful! Returning new tokens.")
    print(f"✅ Token Refresh Debug - User remains logged in (refresh token valid for 7 days)")
    
    return RefreshTokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token_str
    )
