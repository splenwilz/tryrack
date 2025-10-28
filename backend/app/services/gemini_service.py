"""
Gemini AI Service for image background removal
Using Gemini's native image generation (Nano Banana) for professional background cleaning
"""
import base64
import logging
import httpx
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


async def remove_background(image_base64: str) -> Optional[str]:
    """
    Remove background from image using Gemini's image editing capability.
    
    :param image_base64: Base64 encoded image (with or without data URL prefix)
    :return: Base64 encoded cleaned image or None if failed
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not configured, skipping background removal")
        return None
    
    try:
        # Remove data URL prefix if present
        if ',' in image_base64:
            _, image_base64 = image_base64.split(',', 1)
        
        # Prepare request payload for Gemini image editing
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent"
        
        headers = {
            "x-goog-api-key": settings.GEMINI_API_KEY,
            "Content-Type": "application/json"
        }
        
        payload = {
            "contents": [{
                "parts": [
                    {
                        "text": "Remove the background from this clothing item and replace it with a clean white background. Keep the item exactly as it is, only change the background to pure white."
                    },
                    {
                        "inlineData": {
                            "mimeType": "image/jpeg",
                            "data": image_base64
                        }
                    }
                ]
            }],
            "generationConfig": {
                "responseModalities": ["Image"]
            }
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            
            # Extract the generated image from response
            if "candidates" in result and len(result["candidates"]) > 0:
                candidate = result["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    for part in candidate["content"]["parts"]:
                        if "inlineData" in part:
                            cleaned_image_base64 = part["inlineData"]["data"]
                            logger.info("Background removed successfully via Gemini")
                            return f"data:image/png;base64,{cleaned_image_base64}"
            
            logger.warning("No image data in Gemini response")
            return None
            
    except httpx.HTTPError as e:
        logger.error(f"HTTP error during background removal: {e}")
        return None
    except Exception as e:
        logger.error(f"Error removing background with Gemini: {e}")
        return None

