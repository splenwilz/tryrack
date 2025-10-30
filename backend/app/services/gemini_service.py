"""
Gemini AI Service for wardrobe image enhancement
Using Gemini's native image generation (Nano Banana) to enhance wardrobe photos with stylish backgrounds
"""
import base64
import logging
import httpx
import json
import time
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


async def remove_background(image_base64: str) -> Optional[str]:
    """
    Enhance wardrobe image by placing it on a stylish, professional background.
    
    :param image_base64: Base64 encoded image (with or without data URL prefix)
    :return: Base64 encoded enhanced image or None if failed
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not configured, skipping image enhancement")
        return None
    
    try:
        # Extract mime type from data URL or default to jpeg
        mime_type = "image/jpeg"  # default
        if ',' in image_base64:
            prefix, image_base64 = image_base64.split(',', 1)
            if prefix.startswith('data:'):
                # Extract mime type from data URL (e.g., "data:image/png;base64")
                mime_part = prefix.split(';')[0].replace('data:', '')
                if mime_part:
                    mime_type = mime_part
        
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
                        "text": "Transform this clothing item photo into a perfect wardrobe catalog image. If the item is wrinkled, folded, or poorly positioned, straighten it out and present it professionally as if it's being displayed in a high-end fashion app. Place it on a stylish, modern background (soft gradients, subtle patterns, or minimalist designs) that makes the item stand out. Ensure the item is properly oriented, centered, and showcased in the best possible way - as if it's being professionally photographed for a premium wardrobe application. The final result should look polished and catalog-ready."
                    },
                    {
                        "inlineData": {
                            "mimeType": mime_type,
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
                            logger.info("Wardrobe image enhanced successfully via Gemini")
                            return f"data:image/png;base64,{cleaned_image_base64}"
            
            logger.warning("No image data in Gemini response")
            return None
            
    except httpx.HTTPError as e:
        logger.error(f"HTTP error during image enhancement: {e}")
        return None
    except Exception as e:
        logger.error(f"Error enhancing image with Gemini: {e}")
        return None


async def extract_item_metadata(image_base64: str) -> Optional[Dict[str, Any]]:
    """
    🤖 Extract structured metadata from wardrobe item image using Gemini.
    
    Returns a structured JSON with:
    - title: Suggested name for the item
    - category: One of: top, bottom, shoes, dress, outerwear, accessories, underwear
    - colors: Array of color names
    - tags: Array of descriptive tags
    
    :param image_base64: Base64 encoded image (with or without data URL prefix)
    :return: Dict with metadata or None if failed
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("🤖 GEMINI_API_KEY not configured, skipping metadata extraction")
        return None
    
    try:
        logger.info("🤖 DEBUG: Starting metadata extraction")
        
        # Extract mime type from data URL or default to jpeg
        mime_type = "image/jpeg"
        if ',' in image_base64:
            prefix, image_base64 = image_base64.split(',', 1)
            if prefix.startswith('data:'):
                mime_part = prefix.split(';')[0].replace('data:', '')
                if mime_part:
                    mime_type = mime_part
        
        logger.info(f"🤖 DEBUG: Image MIME type detected: {mime_type}")
        
        # Use Gemini Flash (text+vision) for structured extraction
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"
        
        headers = {
            "x-goog-api-key": settings.GEMINI_API_KEY,
            "Content-Type": "application/json"
        }
        
        # Structured prompt for JSON extraction with FULLY FLEXIBLE categories
        prompt = """Analyze this clothing/wardrobe item image and return ONLY a valid JSON object with the following structure:

{
  "title": "A short, descriptive name for this item (e.g., 'Navy Blue Linen Blazer', 'Distressed Denim Jeans')",
  "category": "A clear, specific category name",
  "colors": ["specific color names with shades"],
  "tags": ["style", "material", "occasion", "season"]
}

Rules:
- title: Max 50 characters, descriptive and specific
- category: Use ONE clear, intuitive fashion category term
  * Use LOWERCASE (e.g., "blazer" not "Blazer")
  * Use SINGULAR form (e.g., "sneaker" not "sneakers")
  * Be SPECIFIC but not overly detailed (e.g., "denim jacket" not "blue denim jacket")
  * Use COMMON terms (e.g., "t-shirt" not "tee", "jeans" not "denim pants")
  * Be CONSISTENT - use the same term for similar items
  * Examples: blazer, cardigan, hoodie, t-shirt, jeans, chinos, cargo pants, 
    sneaker, boot, heel, sandal, dress, skirt, shorts, coat, jacket, vest,
    handbag, backpack, hat, scarf, belt, watch, sunglasses, swimsuit, activewear, etc.
- colors: Be specific! Use color names with shades like 'navy blue', 'burgundy', 'olive green', 'charcoal gray', 'rose gold', 'mint green', etc. (1-3 colors)
- tags: 3-5 relevant tags describing style, material, occasion, season, fit (casual, formal, summer, winter, cotton, denim, oversized, slim-fit, etc.)

Return ONLY the JSON object, no additional text."""

        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": image_base64
                        }
                    }
                ]
            }],
            "generationConfig": {
                "temperature": 0.4,  # Lower temperature for more consistent JSON
                "maxOutputTokens": 500,
            }
        }
        
        logger.info("🤖 DEBUG: Sending request to Gemini Flash")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"🤖 DEBUG: Gemini response received: {json.dumps(result, indent=2)}")
            
            # Extract text from response
            if "candidates" in result and len(result["candidates"]) > 0:
                candidate = result["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    for part in candidate["content"]["parts"]:
                        if "text" in part:
                            text_response = part["text"].strip()
                            logger.info(f"🤖 DEBUG: Extracted text: {text_response}")
                            
                            # Parse JSON from response
                            # Remove markdown code blocks if present
                            if text_response.startswith("```"):
                                # Extract JSON from code block
                                lines = text_response.split('\n')
                                text_response = '\n'.join(lines[1:-1])  # Remove first and last lines
                            
                            try:
                                metadata = json.loads(text_response)
                                logger.info(f"🤖 DEBUG: Successfully parsed metadata: {metadata}")
                                
                                # Validate required fields
                                required_fields = ['title', 'category', 'colors', 'tags']
                                if all(field in metadata for field in required_fields):
                                    logger.info("🤖 Metadata extracted successfully via Gemini")
                                    return metadata
                                else:
                                    logger.warning(f"🤖 DEBUG: Missing required fields in metadata: {metadata}")
                                    return None
                            except json.JSONDecodeError as e:
                                logger.error(f"🤖 DEBUG: Failed to parse JSON from Gemini response: {e}")
                                logger.error(f"🤖 DEBUG: Raw text was: {text_response}")
                                return None
            
            logger.warning("🤖 DEBUG: No valid metadata in Gemini response")
            return None
            
    except httpx.HTTPError as e:
        logger.error(f"🤖 DEBUG: HTTP error during metadata extraction: {e}")
        return None
    except Exception as e:
        logger.error(f"🤖 DEBUG: Error extracting metadata with Gemini: {e}")
        import traceback
        logger.error(f"🤖 DEBUG: Traceback: {traceback.format_exc()}")
        return None


async def generate_virtual_tryon(
    user_image_base64: str,
    item_image_base64: str,
    item_category: str,
    item_colors: list[str],
    use_clean_background: bool = False
) -> Optional[str]:
    """
    Generate virtual try-on using Gemini 2.5 Flash Image.
    
    Args:
        user_image_base64: Base64 encoded user photo
        item_image_base64: Base64 encoded item photo
        item_category: Category of the item (e.g., "dress", "shirt")
        item_colors: List of colors for the item
        use_clean_background: Whether to replace background with clean one
        
    Returns:
        Base64 encoded result image or None if failed
    """
    import time
    function_start = time.time()
    print(f"👕 [0.0s] Starting virtual try-on for {item_category} in colors {item_colors}, clean_bg: {use_clean_background}")
    logger.info(f"👕 [0.0s] Starting virtual try-on for {item_category} in colors {item_colors}, clean_bg: {use_clean_background}")
    
    try:
        # Determine MIME types from base64 signatures
        mime_start = time.time()
        
        if user_image_base64.startswith('/9j/') or user_image_base64.startswith('data:image/jpeg'):
            user_mime = 'image/jpeg'
            if user_image_base64.startswith('data:'):
                user_image_base64 = user_image_base64.split(',', 1)[1]
        elif user_image_base64.startswith('iVBOR') or user_image_base64.startswith('data:image/png'):
            user_mime = 'image/png'
            if user_image_base64.startswith('data:'):
                user_image_base64 = user_image_base64.split(',', 1)[1]
        else:
            user_mime = 'image/jpeg'  # Default
        
        if item_image_base64.startswith('/9j/') or item_image_base64.startswith('data:image/jpeg'):
            item_mime = 'image/jpeg'
            if item_image_base64.startswith('data:'):
                item_image_base64 = item_image_base64.split(',', 1)[1]
        elif item_image_base64.startswith('iVBOR') or item_image_base64.startswith('data:image/png'):
            item_mime = 'image/png'
            if item_image_base64.startswith('data:'):
                item_image_base64 = item_image_base64.split(',', 1)[1]
        else:
            item_mime = 'image/jpeg'  # Default
        
        mime_elapsed = time.time() - mime_start
        elapsed = time.time() - function_start
        
        # Log base64 sizes
        user_b64_size = len(user_image_base64) / 1024 / 1024  # MB
        item_b64_size = len(item_image_base64) / 1024 / 1024  # MB
        print(f"📊 [{elapsed:.1f}s] Base64 sizes - User: {user_b64_size:.2f}MB, Item: {item_b64_size:.2f}MB")
        logger.info(f"📊 [{elapsed:.1f}s] Base64 sizes - User: {user_b64_size:.2f}MB, Item: {item_b64_size:.2f}MB")
        
        # Prepare Gemini API payload with multimodal content
        colors_text = ", ".join(item_colors) if item_colors else "original colors"
        
        # Build prompt based on background preference
        if use_clean_background:
            background_instruction = "- Replace the background with a clean, minimalist background perfect for a fashion wardrobe app (soft gradient, studio-style, or elegant neutral backdrop)"
            style_note = "- Make it look styled and photorealistic - as if shot in a professional studio"
            quality_note = "- The final image should look polished, catalog-ready, and suitable for a premium fashion app"
        else:
            background_instruction = "- Keep the background from the person's original photo unchanged"
            style_note = "- Make it look natural and photorealistic"
            quality_note = "- The final image should look realistic and natural"
        
        prompt = f"""Create a realistic virtual try-on image for a wardrobe app, showing this person wearing this {item_category}.

Requirements:
- Keep the person's EXACT pose, body shape, and facial features unchanged
- Fit the {item_category} naturally and realistically on the person's body
- Match the item's colors exactly: {colors_text}
- Maintain realistic lighting, shadows, and fabric draping
{background_instruction}
{style_note}
- Ensure the {item_category} fits the person's body size appropriately
- Preserve all natural proportions and anatomy
{quality_note}

Return ONLY the final generated image with the person wearing the {item_category}."""

        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inlineData": {
                            "mimeType": user_mime,
                            "data": user_image_base64
                        }
                    },
                    {
                        "inlineData": {
                            "mimeType": item_mime,
                            "data": item_image_base64
                        }
                    }
                ]
            }],
            "generationConfig": {
                "responseModalities": ["Image"]
            }
        }
        
        # Send request to Gemini (using same model as background removal)
        api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent"
        
        headers = {
            "x-goog-api-key": settings.GEMINI_API_KEY,
            "Content-Type": "application/json"
        }
        
        elapsed = time.time() - function_start
        print(f"🚀 [{elapsed:.1f}s] Sending request to Gemini 2.5 Flash Image API...")
        logger.info(f"🚀 [{elapsed:.1f}s] Sending request to Gemini 2.5 Flash Image API...")
        api_start = time.time()
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(api_url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
        
        api_elapsed = time.time() - api_start
        total_elapsed = time.time() - function_start
        print(f"✅ [{total_elapsed:.1f}s] Gemini API call took {api_elapsed:.1f}s")
        logger.info(f"✅ [{total_elapsed:.1f}s] Gemini API call took {api_elapsed:.1f}s")
        
        # Extract result image from response (same format as background removal)
        extract_start = time.time()
        
        if "candidates" in result and len(result["candidates"]) > 0:
            candidate = result["candidates"][0]
            
            # Check for inlineData (image response)
            if "content" in candidate and "parts" in candidate["content"]:
                for part in candidate["content"]["parts"]:
                    if "inlineData" in part:
                        result_image_base64 = part["inlineData"]["data"]
                        result_size = len(result_image_base64) / 1024 / 1024  # MB
                        extract_elapsed = time.time() - extract_start
                        total_elapsed = time.time() - function_start
                        print(f"✨ [{total_elapsed:.1f}s] Successfully generated virtual try-on image ({result_size:.2f}MB)")
                        print(f"📊 GEMINI TIMING - Prep: {elapsed:.1f}s | API Call: {api_elapsed:.1f}s | Extract: {extract_elapsed:.3f}s | Total: {total_elapsed:.1f}s")
                        logger.info(f"✨ [{total_elapsed:.1f}s] Successfully generated virtual try-on image ({result_size:.2f}MB)")
                        logger.info(f"📊 GEMINI TIMING - Prep: {elapsed:.1f}s | API Call: {api_elapsed:.1f}s | Extract: {extract_elapsed:.3f}s | Total: {total_elapsed:.1f}s")
                        return result_image_base64
                    elif "text" in part:
                        logger.warning(f"⚠️ Received text response instead of image: {part['text'][:200]}")
            
            total_elapsed = time.time() - function_start
            logger.error(f"❌ [{total_elapsed:.1f}s] No image data found in Gemini response")
            logger.debug(f"Response structure: {json.dumps(result, indent=2)[:500]}")
            return None
        else:
            total_elapsed = time.time() - function_start
            logger.error(f"❌ [{total_elapsed:.1f}s] No candidates in Gemini response")
            logger.debug(f"Response: {json.dumps(result, indent=2)[:500]}")
            return None
            
    except httpx.HTTPError as e:
        logger.error(f"❌ HTTP error during virtual try-on generation: {e}")
        if hasattr(e, 'response') and e.response:
            logger.error(f"Response status: {e.response.status_code}")
            logger.error(f"Response body: {e.response.text[:500]}")
        return None
    except Exception as e:
        logger.error(f"❌ Error generating virtual try-on with Gemini: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return None

