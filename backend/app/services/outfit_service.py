"""
Outfit Compatibility Service

Provides wardrobe-based suggestions for compatible items using:
- Color theory (complementary, analogous, neutral matching)
- Category compatibility rules
- Style tag matching
- Gender-aware suggestions when relevant

References:
- Color theory basics: https://www.canva.com/colors/color-wheel/
- Fashion compatibility rules: Standard fashion styling guidelines
"""
import logging
from typing import List, Dict, Any, Optional
from app.models import WardrobeItem, ItemStatus

logger = logging.getLogger(__name__)


# Category compatibility mapping: what categories pair well together
# Reference: Standard fashion outfit construction rules
CATEGORY_COMPATIBILITY = {
    "top": ["bottom", "shoes", "outerwear", "accessories"],
    "bottom": ["top", "shoes", "outerwear", "accessories"],
    "dress": ["shoes", "outerwear", "accessories"],
    "outerwear": ["top", "bottom", "shoes", "accessories"],
    "shoes": ["top", "bottom", "dress", "outerwear"],
    "accessories": ["top", "bottom", "dress", "outerwear"],
    "underwear": [],  # Not typically paired for visible try-ons
}

# Category normalization: map specific categories to generic categories
# This allows "sweater" -> "top", "jeans" -> "bottom", etc.
CATEGORY_MAP = {
    # Tops
    "shirt": "top",
    "t-shirt": "top",
    "tshirt": "top",
    "blouse": "top",
    "sweater": "top",
    "hoodie": "top",
    "jacket": "top",  # Light jackets are like tops
    "cardigan": "top",
    "polo": "top",
    "tank": "top",
    "tank top": "top",
    
    # Bottoms
    "pant": "bottom",
    "pants": "bottom",
    "jeans": "bottom",
    "chino": "bottom",
    "chinos": "bottom",
    "trouser": "bottom",
    "trousers": "bottom",
    "short": "bottom",
    "shorts": "bottom",
    "skirt": "bottom",
    
    # Outerwear (keep as is)
    "coat": "outerwear",
    "blazer": "outerwear",
    "overcoat": "outerwear",
    "parka": "outerwear",
    
    # Keep original categories as-is
    "top": "top",
    "bottom": "bottom",
    "dress": "dress",
    "shoes": "shoes",
    "accessories": "accessories",
    "outerwear": "outerwear",
}


def normalize_category(category: str) -> str:
    """Normalize a category name to a generic category for compatibility matching.
    
    Maps specific categories (e.g., "sweater", "shirt") to generic ones (e.g., "top").
    
    Args:
        category: Category string from database (e.g., "sweater", "jeans")
        
    Returns:
        Normalized generic category (e.g., "top", "bottom")
    """
    normalized = category.lower().strip()
    return CATEGORY_MAP.get(normalized, normalized)

# Neutral colors that pair well with most colors
# Reference: Fashion color theory - neutrals as base colors
NEUTRAL_COLORS = {
    "black", "white", "gray", "grey", "navy", "beige", "tan", "brown",
    "charcoal", "ivory", "cream", "khaki", "olive", "burgundy"
}

# Color wheel relationships for complementary matching
# Simplified color theory: colors opposite on color wheel complement each other
COLOR_COMPLEMENTARY = {
    "red": "green",
    "orange": "blue",
    "yellow": "purple",
    "green": "red",
    "blue": "orange",
    "purple": "yellow",
}

# Analogous colors (colors next to each other on color wheel) work well together
COLOR_ANALOGOUS_GROUPS = [
    {"red", "orange", "yellow"},
    {"yellow", "green", "blue"},
    {"blue", "purple", "pink"},
    {"red", "pink", "purple"},
]


def normalize_color(color_str: str) -> str:
    """Normalize color string to lowercase for comparison.
    
    Args:
        color_str: Color name string (e.g., "Navy Blue", "navy blue")
        
    Returns:
        Lowercase normalized color string
    """
    return color_str.lower().strip()


def is_neutral_color(color: str) -> bool:
    """Check if a color is a neutral color.
    
    Neutral colors pair well with almost any color.
    
    Args:
        color: Normalized color string
        
    Returns:
        True if color is neutral
    """
    normalized = normalize_color(color)
    # Check if normalized color contains any neutral keyword
    return any(neutral in normalized for neutral in NEUTRAL_COLORS)


def calculate_color_compatibility(item_colors: List[str], wardrobe_item_colors: List[str]) -> float:
    """Calculate color compatibility score between two sets of colors.
    
    Scoring logic:
    - Neutral + any color: 0.9 score
    - Complementary colors: 0.8 score
    - Analogous colors: 0.7 score
    - Same/similar colors: 0.6 score
    - Mismatched colors: 0.3 score
    
    Args:
        item_colors: Colors of the item being tried on
        wardrobe_item_colors: Colors of wardrobe item to check compatibility
        
    Returns:
        Compatibility score from 0.0 to 1.0
    """
    if not item_colors or not wardrobe_item_colors:
        return 0.5  # Neutral score if colors unknown
    
    item_colors_normalized = [normalize_color(c) for c in item_colors]
    wardrobe_colors_normalized = [normalize_color(c) for c in wardrobe_item_colors]
    
    # Check for neutral colors (highest compatibility)
    item_has_neutral = any(is_neutral_color(c) for c in item_colors_normalized)
    wardrobe_has_neutral = any(is_neutral_color(c) for c in wardrobe_colors_normalized)
    if item_has_neutral or wardrobe_has_neutral:
        return 0.9
    
    # Check for complementary colors
    for item_color in item_colors_normalized:
        for wardrobe_color in wardrobe_colors_normalized:
            # Extract base color (e.g., "navy blue" -> "blue", "light green" -> "green")
            # Take the LAST word, which is typically the actual hue
            item_tokens = item_color.split()
            wardrobe_tokens = wardrobe_color.split()
            item_base = item_tokens[-1] if item_tokens else item_color
            wardrobe_base = wardrobe_tokens[-1] if wardrobe_tokens else wardrobe_color
            
            # Check if colors are complementary
            if COLOR_COMPLEMENTARY.get(item_base) == wardrobe_base or \
               COLOR_COMPLEMENTARY.get(wardrobe_base) == item_base:
                return 0.8
            
            # Check if colors are in same analogous group
            for group in COLOR_ANALOGOUS_GROUPS:
                if item_base in group and wardrobe_base in group:
                    return 0.7
            
            # Check for similar/same colors
            if item_base == wardrobe_base or item_base in wardrobe_color or wardrobe_base in item_color:
                return 0.6
    
    # Default: somewhat compatible but not ideal
    return 0.3


def calculate_style_compatibility(item_tags: List[str], wardrobe_item_tags: List[str]) -> float:
    """Calculate style compatibility based on tags.
    
    Matches formal with formal, casual with casual, etc.
    
    Args:
        item_tags: Style tags of item being tried on
        wardrobe_item_tags: Style tags of wardrobe item
        
    Returns:
        Compatibility score from 0.0 to 1.0
    """
    if not item_tags or not wardrobe_item_tags:
        return 0.5  # Neutral if no tags
    
    item_tags_lower = {t.lower() for t in item_tags}
    wardrobe_tags_lower = {t.lower() for t in wardrobe_item_tags}
    
    # Check for matching style keywords
    style_keywords = {
        "formal", "casual", "sporty", "elegant", "vintage", "modern",
        "classic", "trendy", "minimalist", "bohemian", "street", "business"
    }
    
    item_style = item_tags_lower & style_keywords
    wardrobe_style = wardrobe_tags_lower & style_keywords
    
    if item_style and wardrobe_style:
        if item_style == wardrobe_style:
            return 0.9  # Perfect style match
        else:
            return 0.5  # Different styles (might work but less ideal)
    
    # If no specific style tags match, neutral score
    return 0.5


def get_compatible_items(
    item_category: str,
    item_colors: List[str],
    wardrobe_items: List[WardrobeItem],
    item_tags: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """Get compatible wardrobe items for a given item being tried on.
    
    Analyzes compatibility based on:
    1. Category compatibility (top pairs with bottom, etc.)
    2. Color compatibility (neutral, complementary, analogous)
    3. Style tag matching (formal with formal, casual with casual)
    
    Args:
        item_category: Category of item being tried on (e.g., "top", "bottom")
        item_colors: Colors of item being tried on
        wardrobe_items: List of user's wardrobe items to check
        item_tags: Optional tags from the item being tried on (for style matching)
        
    Returns:
        List of compatible items with compatibility scores, sorted by score (highest first).
        Format: [
            {
                "item": WardrobeItem,
                "score": float (0.0-1.0),
                "reasons": List[str]  # Why it's compatible
            },
            ...
        ]
    """
    if not wardrobe_items:
        logger.info(f"No wardrobe items provided for compatibility check")
        return []
    
    # Normalize the item category to generic category
    normalized_item_category = normalize_category(item_category)
    logger.info(f"Normalized category '{item_category}' -> '{normalized_item_category}'")
    
    # Get compatible categories for this item category
    compatible_categories = CATEGORY_COMPATIBILITY.get(normalized_item_category, [])
    
    if not compatible_categories:
        logger.info(f"No compatible categories found for normalized category '{normalized_item_category}' (original: '{item_category}')")
        return []
    
    # Also normalize the compatible categories to handle all variations
    # For example, compatible_categories might be ["bottom"], but we need to check for "jeans", "chino", etc.
    compatible_items = []
    # Use provided item_tags, or empty list if not provided
    item_tags = item_tags or []
    
    for wardrobe_item in wardrobe_items:
        # Normalize wardrobe item category
        normalized_wardrobe_category = normalize_category(wardrobe_item.category)
        
        # Only suggest items in compatible categories
        # Check both the normalized category and original (in case it matches directly)
        if normalized_wardrobe_category not in compatible_categories and wardrobe_item.category not in compatible_categories:
            continue
        
        # Only suggest clean items (available for use)
        if wardrobe_item.status != ItemStatus.CLEAN:
            continue
        
        # Calculate compatibility score
        color_score = calculate_color_compatibility(
            item_colors,
            wardrobe_item.colors or []
        )
        
        style_score = calculate_style_compatibility(
            item_tags,
            wardrobe_item.tags or []
        )
        
        # Weighted average: color is more important than style
        compatibility_score = (color_score * 0.7) + (style_score * 0.3)
        
        logger.info(f"Compatibility for item {wardrobe_item.id} ({wardrobe_item.title}): "
                   f"color_score={color_score:.2f}, style_score={style_score:.2f}, "
                   f"compatibility_score={compatibility_score:.2f} "
                   f"(item_colors={item_colors}, wardrobe_colors={wardrobe_item.colors}, "
                   f"item_tags={item_tags}, wardrobe_tags={wardrobe_item.tags})")
        
        # Build reasons for compatibility
        reasons = []
        if color_score >= 0.8:
            reasons.append("Excellent color match")
        elif color_score >= 0.6:
            reasons.append("Good color compatibility")
        
        if style_score >= 0.8:
            reasons.append("Matching style")
        
        if wardrobe_item.category in ["bottom", "shoes"]:
            reasons.append(f"Perfect for {item_category}")
        
        # Only include items with decent compatibility (score >= 0.4)
        if compatibility_score >= 0.4:
            compatible_items.append({
                "item": wardrobe_item,
                "score": round(compatibility_score, 2),
                "reasons": reasons if reasons else ["Compatible item"]
            })
    
    # Sort by compatibility score (highest first)
    compatible_items.sort(key=lambda x: x["score"], reverse=True)
    
    logger.info(f"Found {len(compatible_items)} compatible items for {item_category}")
    
    return compatible_items

