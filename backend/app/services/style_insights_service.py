"""
Style Insights Service

Calculates style analytics from user wardrobe data:
- Style preferences (minimalist, formal, casual, etc.)
- Color palette distribution
- Category distribution
- Formality profile
- Style evolution over time

References:
- Fashion analytics best practices: Industry standard wardrobe analysis
"""
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta, timezone
from collections import Counter
from app.models import WardrobeItem

logger = logging.getLogger(__name__)

# Style keywords to detect from tags
# Reference: Common fashion style categories
STYLE_KEYWORDS = {
    "minimalist", "formal", "casual", "elegant", "vintage", "modern",
    "classic", "trendy", "bohemian", "street", "business", "sporty",
    "romantic", "edgy", "preppy", "grunge", "feminine", "masculine"
}


def calculate_style_preferences(items: List[WardrobeItem]) -> Dict[str, float]:
    """
    Calculate style preference percentages from wardrobe items.
    
    Args:
        items: List of wardrobe items
        
    Returns:
        Dict mapping style keywords to percentages (0-100)
    """
    if not items:
        logger.info("No items provided for style preferences calculation")
        return {}
    
    style_counts: Dict[str, int] = {keyword: 0 for keyword in STYLE_KEYWORDS}
    total_items = len(items)
    items_with_tags = 0
    
    for item in items:
        if not item.tags:
            continue
        
        items_with_tags += 1
        # Tags is a JSON array, normalize to lowercase for matching
        tags_lower = [tag.lower() if isinstance(tag, str) else str(tag).lower() for tag in item.tags]
        tags_set = set(tags_lower)
        
        # Count items that contain each style keyword
        for keyword in STYLE_KEYWORDS:
            if keyword in tags_set:
                style_counts[keyword] += 1
    
    logger.info(f"Style calculation: {total_items} total items, {items_with_tags} items with tags")
    logger.info(f"Style counts: {dict((k, v) for k, v in style_counts.items() if v > 0)}")
    
    # Convert counts to percentages
    style_percentages = {}
    for keyword, count in style_counts.items():
        percentage = (count / total_items) * 100 if total_items > 0 else 0.0
        # Only include styles that appear in at least one item
        if count > 0:
            style_percentages[keyword] = round(percentage, 1)
            logger.info(f"Style '{keyword}': {count}/{total_items} = {percentage}%")
    
    return style_percentages


def calculate_color_palette(items: List[WardrobeItem]) -> List[Dict[str, any]]:
    """
    Calculate color palette distribution from wardrobe items.
    
    Args:
        items: List of wardrobe items
        
    Returns:
        List of dicts with 'color' and 'percentage' keys, sorted by frequency
    """
    if not items:
        return []
    
    color_counter = Counter()
    total_color_occurrences = 0
    
    for item in items:
        if not item.colors:
            continue
        
        # Colors is a JSON array
        for color in item.colors:
            if isinstance(color, str) and color.strip():
                # Normalize color name (lowercase, trimmed)
                color_normalized = color.strip().lower()
                color_counter[color_normalized] += 1
                total_color_occurrences += 1
    
    if total_color_occurrences == 0:
        return []
    
    # Convert to list of dicts with percentages
    color_palette = []
    for color, count in color_counter.most_common():
        percentage = (count / total_color_occurrences) * 100
        color_palette.append({
            "color": color.title(),  # Capitalize first letter
            "percentage": round(percentage, 1)
        })
    
    return color_palette


def calculate_category_distribution(items: List[WardrobeItem]) -> Dict[str, float]:
    """
    Calculate category distribution from wardrobe items.
    
    Args:
        items: List of wardrobe items
        
    Returns:
        Dict mapping categories to percentages (0-100)
    """
    if not items:
        return {}
    
    category_counter = Counter()
    
    for item in items:
        if item.category:
            category_counter[item.category.lower()] += 1
    
    total_items = len(items)
    category_distribution = {}
    
    for category, count in category_counter.items():
        percentage = (count / total_items) * 100 if total_items > 0 else 0.0
        category_distribution[category] = round(percentage, 1)
    
    return category_distribution


def calculate_formality_profile(items: List[WardrobeItem]) -> float:
    """
    Calculate average formality score from wardrobe items.
    
    Args:
        items: List of wardrobe items
        
    Returns:
        Average formality score (0.0-1.0), converted to percentage (0-100)
    """
    if not items:
        return 0.0
    
    formality_scores = []
    for item in items:
        if item.formality is not None:
            formality_scores.append(item.formality)
    
    if not formality_scores:
        return 0.0
    
    average_formality = sum(formality_scores) / len(formality_scores)
    # Convert to percentage (0-100)
    return round(average_formality * 100, 1)


def calculate_style_evolution(items: List[WardrobeItem]) -> Optional[Dict[str, any]]:
    """
    Calculate style evolution by comparing recent vs older items.
    
    Args:
        items: List of wardrobe items
        
    Returns:
        Dict with evolution data, or None if insufficient data
    """
    if len(items) < 4:  # Need at least 4 items to compare meaningfully
        return None
    
    # Use timezone-aware datetime for comparison (DB stores UTC with timezone)
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    
    # Normalize item.created_at to UTC if it's timezone-aware, otherwise assume UTC
    def normalize_datetime(dt):
        if dt is None:
            return None
        if dt.tzinfo is None:
            # If naive, assume UTC
            return dt.replace(tzinfo=timezone.utc)
        # If aware, convert to UTC
        return dt.astimezone(timezone.utc)
    
    recent_items = [
        item for item in items 
        if item.created_at and normalize_datetime(item.created_at) >= thirty_days_ago
    ]
    older_items = [
        item for item in items 
        if item.created_at and normalize_datetime(item.created_at) < thirty_days_ago
    ]
    
    if len(recent_items) == 0 or len(older_items) == 0:
        return None
    
    # Calculate style tag changes
    recent_tags = Counter()
    older_tags = Counter()
    
    for item in recent_items:
        if item.tags:
            for tag in item.tags:
                if isinstance(tag, str):
                    tag_lower = tag.lower()
                    if tag_lower in STYLE_KEYWORDS:
                        recent_tags[tag_lower] += 1
    
    for item in older_items:
        if item.tags:
            for tag in item.tags:
                if isinstance(tag, str):
                    tag_lower = tag.lower()
                    if tag_lower in STYLE_KEYWORDS:
                        older_tags[tag_lower] += 1
    
    # Calculate percentage changes for common tags
    evolution_data = {
        "recent_period": "Last 30 days",
        "previous_period": "Before last 30 days",
        "changes": {}
    }
    
    all_tags = set(recent_tags.keys()) | set(older_tags.keys())
    
    for tag in all_tags:
        recent_count = recent_tags.get(tag, 0)
        older_count = older_tags.get(tag, 0)
        
        recent_pct = (recent_count / len(recent_items)) * 100 if len(recent_items) > 0 else 0
        older_pct = (older_count / len(older_items)) * 100 if len(older_items) > 0 else 0
        
        change = recent_pct - older_pct
        
        if abs(change) >= 5.0:  # Only report significant changes (5%+)
            evolution_data["changes"][tag] = {
                "recent_percentage": round(recent_pct, 1),
                "previous_percentage": round(older_pct, 1),
                "change": round(change, 1),
                "trend": "up" if change > 0 else "down"
            }
    
    if not evolution_data["changes"]:
        return None
    
    return evolution_data


def calculate_all_insights(items: List[WardrobeItem]) -> Dict[str, any]:
    """
    Calculate all style insights from wardrobe items.
    
    Args:
        items: List of wardrobe items
        
    Returns:
        Dict with all calculated insights
    """
    return {
        "style_preferences": calculate_style_preferences(items),
        "color_palette": calculate_color_palette(items),
        "category_distribution": calculate_category_distribution(items),
        "average_formality": calculate_formality_profile(items),
        "style_evolution": calculate_style_evolution(items)
    }

