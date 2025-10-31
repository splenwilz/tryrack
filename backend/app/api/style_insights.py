"""
Style Insights API

Provides style analytics endpoints for user wardrobe analysis.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.db import get_db
from app.core.auth import get_current_user_id
from app.services import get_wardrobe_items
from app.services.style_insights_service import calculate_all_insights
from app.schemas import StyleInsightsResponse

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/style-insights",
    tags=["style-insights"],
    dependencies=[Depends(get_current_user_id)],
)


@router.get("/", response_model=StyleInsightsResponse)
def get_style_insights(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    """
    Get style insights for the current user's wardrobe.
    
    Calculates:
    - Style preferences (percentage of items with each style tag)
    - Color palette (most common colors with percentages)
    - Category distribution (percentage of items per category)
    - Average formality (0-100%)
    - Style evolution (changes in style over last 30 days, if applicable)
    
    Returns empty data if user has no wardrobe items.
    """
    try:
        logger.info(f"📊 Calculating style insights for user {user_id}")
        
        # Get all wardrobe items for the user
        items = get_wardrobe_items(db, user_id, limit=1000)  # Get up to 1000 items
        
        if not items:
            logger.info(f"No wardrobe items found for user {user_id}")
            # Return empty insights
            return StyleInsightsResponse(
                style_preferences={},
                color_palette=[],
                category_distribution={},
                average_formality=0.0,
                style_evolution=None
            )
        
        # Calculate all insights
        insights = calculate_all_insights(items)
        
        logger.info(f"✅ Calculated insights for {len(items)} items")
        logger.info(f"📊 Style preferences: {insights.get('style_preferences', {})}")
        logger.info(f"📊 Top colors: {insights.get('color_palette', [])[:3]}")
        logger.info(f"📊 Average formality: {insights.get('average_formality', 0)}")
        logger.info(f"📊 Full insights response: {insights}")
        
        response = StyleInsightsResponse(**insights)
        logger.info(f"📊 Response model: style_preferences={response.style_preferences}, "
                   f"color_palette count={len(response.color_palette)}, "
                   f"average_formality={response.average_formality}")
        
        return response
        
    except Exception as e:
        logger.exception(f"❌ Error calculating style insights: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate style insights: {str(e)}"
        ) from e

