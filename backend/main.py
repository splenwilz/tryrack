"""
FastAPI application with WorkOS AuthKit integration.
Based on WorkOS documentation: https://workos.com/docs/authkit/react/python
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="TryRack Backend",
    description="FastAPI backend with WorkOS AuthKit authentication",
    version="0.1.0"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",  # Expo web app
        "http://localhost:3000",  # Alternative frontend port
        "http://127.0.0.1:8081",  # Alternative localhost format
        "http://127.0.0.1:3000",  # Alternative localhost format
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Import and include auth routes
from auth import router as auth_router
app.include_router(auth_router, prefix="/auth", tags=["authentication"])

# Import and include API routes
from api import router as api_router
app.include_router(api_router, prefix="/api", tags=["api"])

@app.get("/")
async def root():
    """Root endpoint - basic health check"""
    return {"message": "TryRack Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
