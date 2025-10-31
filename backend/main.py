from app.core.app import create_app
from app.api import router as api_router
from app.api.users import router as users_router
from app.api.oauth import router as oauth_router
from app.api.auth import router as auth_router
from app.api.wardrobe import router as wardrobe_router
from app.api.virtual_tryon import router as virtual_tryon_router
from app.api.style_insights import router as style_insights_router
from app.core.config import settings

app = create_app()

# Include routers
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(oauth_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(wardrobe_router, prefix=settings.API_V1_STR)
app.include_router(virtual_tryon_router, prefix=f"{settings.API_V1_STR}/virtual-tryon", tags=["virtual-tryon"])
app.include_router(style_insights_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
    )
