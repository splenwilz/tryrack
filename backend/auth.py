"""
WorkOS AuthKit authentication endpoints for FastAPI.
Based on WorkOS documentation: https://workos.com/docs/authkit/react/python
"""

from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from workos import WorkOSClient
from dotenv import load_dotenv
import os
from functools import wraps
from sqlalchemy.orm import Session
from database import get_db
import crud
import schemas

# Load environment variables
load_dotenv()

# Initialize WorkOS client
# Reference: https://workos.com/docs/authkit/react/python/1-configure-your-project/set-secrets
workos = WorkOSClient(
    api_key=os.getenv("WORKOS_API_KEY"),
    client_id=os.getenv("WORKOS_CLIENT_ID")
)

# Cookie password for session sealing
# Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/create-a-session-password
cookie_password = os.getenv("WORKOS_COOKIE_PASSWORD")

# Redirect URI for WorkOS callbacks
redirect_uri = os.getenv("WORKOS_REDIRECT_URI", "http://localhost:8000/auth/callback")

# Frontend URL for redirects after authentication
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:8081")

router = APIRouter()

@router.get("/login")
async def login():
    """
    Login endpoint - redirects user to WorkOS AuthKit hosted login page.
    Reference: https://workos.com/docs/authkit/react/python/2-add-authkit-to-your-app/add-a-login-endpoint
    """
    try:
        # Check if WorkOS credentials are configured
        if not os.getenv("WORKOS_API_KEY") or not os.getenv("WORKOS_CLIENT_ID"):
            raise HTTPException(
                status_code=500, 
                detail="WorkOS credentials not configured. Please set WORKOS_API_KEY and WORKOS_CLIENT_ID in your .env file"
            )
        
        # Generate authorization URL for AuthKit
        # Reference: https://workos.com/docs/authkit/react/python/2-add-authkit-to-your-app/add-a-login-endpoint
        authorization_url = workos.user_management.get_authorization_url(
            provider="authkit",
            redirect_uri=redirect_uri
        )
        
        # Redirect user to WorkOS hosted login page
        return RedirectResponse(url=authorization_url)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate login URL: {str(e)}")

@router.get("/callback")
async def callback(request: Request, db: Session = Depends(get_db)):
    """
    Callback endpoint - handles the response from WorkOS after authentication.
    Creates or updates user in our database.
    Reference: https://workos.com/docs/authkit/react/python/2-add-authkit-to-your-app/add-a-callback-endpoint
    """
    # Extract authorization code from query parameters
    # Reference: https://workos.com/docs/authkit/react/python/2-add-authkit-to-your-app/add-a-callback-endpoint
    code = request.query_params.get("code")
    
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code not found")
    
    try:
        # Exchange authorization code for authenticated user
        # Reference: https://workos.com/docs/authkit/react/python/2-add-authkit-to-your-app/add-a-callback-endpoint
        auth_response = workos.user_management.authenticate_with_code(
            code=code,
            session={
                "seal_session": True,
                "cookie_password": cookie_password
            }
        )
        
        # Create or update user in our database
        user_data = auth_response.user
        existing_user = crud.get_user_by_workos_id(db, user_data.id)
        
        if existing_user:
            # Update existing user's last login
            crud.update_user_last_login(db, existing_user.id)
        else:
            # Create new user in our database
            user_create = schemas.UserCreate(
                workos_user_id=user_data.id,
                email=user_data.email,
                first_name=user_data.first_name,
                last_name=user_data.last_name
            )
            new_user = crud.create_user(db, user_create)
            # Update last login for the new user
            crud.update_user_last_login(db, new_user.id)
        
        # Create response with redirect to frontend
        # Reference: https://workos.com/docs/authkit/react/python/2-add-authkit-to-your-app/add-a-callback-endpoint
        response = RedirectResponse(url=frontend_url)
        
        # Store sealed session in secure cookie
        # Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/save-the-encrypted-session
        response.set_cookie(
            key="wos_session",
            value=auth_response.sealed_session,
            httponly=True,
            secure=False,  # Set to False for localhost development
            samesite="lax",
            max_age=86400,  # 24 hours
            domain="localhost"  # Allow cookie to work across localhost ports
        )
        
        return response
    
    except Exception as e:
        # On error, redirect back to login
        # Reference: https://workos.com/docs/authkit/react/python/2-add-authkit-to-your-app/add-a-callback-endpoint
        return RedirectResponse(url=frontend_url)

@router.get("/logout")
async def logout(request: Request):
    """
    Logout endpoint - ends user session and redirects to WorkOS logout.
    Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/ending-the-session
    """
    try:
        # Load sealed session from cookie
        # Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/ending-the-session
        session = workos.user_management.load_sealed_session(
            sealed_session=request.cookies.get("wos_session"),
            cookie_password=cookie_password,
        )
        
        # Get logout URL from WorkOS
        # Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/ending-the-session
        logout_url = session.get_logout_url()
        
        # Create response with logout redirect
        response = RedirectResponse(url=logout_url)
        
        # Delete session cookie
        # Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/ending-the-session
        response.delete_cookie("wos_session")
        
        return response
    
    except Exception as e:
        # If logout fails, still clear the cookie and redirect
        response = RedirectResponse(url=frontend_url)
        response.delete_cookie("wos_session")
        return response

@router.get("/me")
async def get_current_user(request: Request):
    """
    Get current authenticated user information.
    Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/protected-routes
    """
    try:
        # Load sealed session from cookie
        # Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/protected-routes
        session = workos.user_management.load_sealed_session(
            sealed_session=request.cookies.get("wos_session"),
            cookie_password=cookie_password,
        )
        
        # Authenticate the session
        # Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/protected-routes
        auth_response = session.authenticate()
        
        if auth_response.authenticated:
            return {
                "authenticated": True,
                "user": {
                    "id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "first_name": auth_response.user.first_name,
                    "last_name": auth_response.user.last_name,
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Not authenticated")
    
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


def get_current_user(request: Request, db: Session = Depends(get_db)):
    """
    Dependency function to get current authenticated user from database.
    This integrates WorkOS authentication with our database.
    """
    try:
        # Load sealed session from cookie
        session = workos.user_management.load_sealed_session(
            sealed_session=request.cookies.get("wos_session"),
            cookie_password=cookie_password,
        )
        
        # Authenticate the session
        auth_response = session.authenticate()
        
        if not auth_response.authenticated:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        # Get user from our database using WorkOS user ID
        user = crud.get_user_by_workos_id(db, auth_response.user.id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found in database")
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


def require_auth(func):
    """
    Decorator to protect routes that require authentication.
    Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/protected-routes
    """
    @wraps(func)
    async def wrapper(request: Request, *args, **kwargs):
        try:
            # Load sealed session from cookie
            # Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/protected-routes
            session = workos.user_management.load_sealed_session(
                sealed_session=request.cookies.get("wos_session"),
                cookie_password=cookie_password,
            )
            
            # Authenticate the session
            auth_response = session.authenticate()
            
            if auth_response.authenticated:
                # Add user to request context
                request.state.user = auth_response.user
                return await func(request, *args, **kwargs)
            
            # If no session cookie provided, redirect to frontend
            if (auth_response.authenticated is False and 
                auth_response.reason == "no_session_cookie_provided"):
                return RedirectResponse(url=frontend_url)
            
            # Try to refresh the session
            # Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/protected-routes
            try:
                result = session.refresh()
                if result.authenticated:
                    # Update cookie with refreshed session
                    response = await func(request, *args, **kwargs)
                    if isinstance(response, JSONResponse):
                        response.set_cookie(
                            "wos_session",
                            result.sealed_session,
                            httponly=True,
                            secure=True,
                            samesite="lax",
                            max_age=86400
                        )
                    return response
                else:
                    return RedirectResponse(url=frontend_url)
            
            except Exception:
                # Refresh failed, redirect to frontend
                return RedirectResponse(url=frontend_url)
        
        except Exception as e:
            return RedirectResponse(url=frontend_url)
    
    return wrapper

@router.get("/protected")
async def protected_route(request: Request):
    """
    Example protected route that requires authentication.
    This endpoint redirects to login page for web browsers (following WorkOS patterns).
    Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/protected-routes
    """
    try:
        # Load sealed session from cookie
        # Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/protected-routes
        session = workos.user_management.load_sealed_session(
            sealed_session=request.cookies.get("wos_session"),
            cookie_password=cookie_password,
        )
        
        # Authenticate the session
        auth_response = session.authenticate()
        
        if auth_response.authenticated:
            user = auth_response.user
            return {
                "message": f"Hello {user.first_name}! This is a protected route.",
                "user_id": user.id,
                "email": user.email
            }
        else:
            # Redirect to frontend (web-friendly behavior)
            return RedirectResponse(url=frontend_url)
    
    except Exception as e:
        # Redirect to frontend on any error (web-friendly behavior)
        return RedirectResponse(url=frontend_url)

@router.get("/protected-api")
async def api_protected_route(request: Request):
    """
    API-style protected route that returns proper HTTP status codes.
    This endpoint returns 401 for API clients instead of redirecting.
    Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/protected-routes
    """
    try:
        # Load sealed session from cookie
        # Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/protected-routes
        session = workos.user_management.load_sealed_session(
            sealed_session=request.cookies.get("wos_session"),
            cookie_password=cookie_password,
        )
        
        # Authenticate the session
        auth_response = session.authenticate()
        
        if auth_response.authenticated:
            user = auth_response.user
            return {
                "message": f"Hello {user.first_name}! This is a protected API route.",
                "user_id": user.id,
                "email": user.email
            }
        else:
            raise HTTPException(status_code=401, detail="Not authenticated")
    
    except Exception as e:
        # Check if it's a missing session cookie
        if "no_session_cookie_provided" in str(e) or not request.cookies.get("wos_session"):
            raise HTTPException(status_code=401, detail="No session cookie provided")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
