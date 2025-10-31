"""
Gemini AI Service for wardrobe image enhancement
Using Gemini's native image generation (Nano Banana) to enhance wardrobe photos with stylish backgrounds
"""
import base64
import asyncio
import logging
import httpx
import json
import time
from typing import Optional, Dict, Any, List
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
                        "text": "Transform this clothing item into a professional catalog image. Straighten wrinkles/folds, center on stylish minimalist background (soft gradient or studio backdrop). Output polished, app-ready result."
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
        
        # Concise structured prompt for JSON extraction
        prompt = """Extract wardrobe item metadata. Return ONLY valid JSON:
{
  "title": "short descriptive name (max 50 chars)",
  "category": "lowercase singular term (e.g., blazer, t-shirt, jeans, dress, sneaker, handbag)",
  "colors": ["1-3 specific colors with shades like navy blue, burgundy, olive green"],
  "tags": ["3-5 tags: style/material/occasion/season/fit"]
}

Rules: category=lowercase singular (blazer not Blazer, sneaker not sneakers). colors=specific shades. tags=3-5 descriptive. Return JSON only."""

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
    items: List[Dict[str, Any]],  # List of items: [{"image_base64": "...", "category": "top", "colors": ["blue"], "tags": [...], "formality": 0.7}, ...]
    use_clean_background: bool = False,
    custom_prompt: Optional[str] = None  # Optional: user-defined custom prompt
) -> Optional[str]:
    """
    Generate virtual try-on using Gemini 2.5 Flash Image.
    
    Supports both single-item (backward compatible) and multi-item try-ons.
    Uses simplified prompts that preserve user's actual appearance (no formality enhancements).
    
    Args:
        user_image_base64: Base64 encoded user photo
        items: List of item dictionaries, each containing:
            - image_base64: Base64 encoded item photo
            - category: Category of the item (e.g., "top", "bottom", "shoes")
            - colors: List of colors for the item (e.g., ["blue", "white"])
            - tags: Optional list of style tags
            - formality: Optional formality score (deprecated, kept for backward compat)
        use_clean_background: Whether to replace background with clean one
        custom_prompt: Optional user-defined prompt (overrides default prompt if provided)
        
    Returns:
        Base64 encoded result image or None if failed
        
    Example items format (single item for backward compatibility):
        [{"image_base64": "...", "category": "shirt", "colors": ["blue"], "tags": ["formal"], "formality": 0.8}]
    
    Example items format (multiple items):
        [
            {"image_base64": "...", "category": "top", "colors": ["blue"], "tags": ["formal"], "formality": 0.8},
            {"image_base64": "...", "category": "bottom", "colors": ["black"], "tags": ["business"], "formality": 0.7},
            {"image_base64": "...", "category": "shoes", "colors": ["brown"], "tags": ["dress_shoes"]}
        ]
    """
    import time
    function_start = time.time()
    
    # Validate items list
    if not items or len(items) == 0:
        logger.error("❌ No items provided for virtual try-on")
        return None
    
    num_items = len(items)
    item_categories = [item.get("category", "unknown") for item in items]
    logger.info(f"👕 [0.0s] Starting virtual try-on for {num_items} item(s): {item_categories}, clean_bg: {use_clean_background}")
    print(f"👕 [0.0s] Starting virtual try-on for {num_items} item(s): {item_categories}, clean_bg: {use_clean_background}")
    
    try:
        # Determine MIME type for user image
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
        
        # Process all item images - determine MIME types and clean base64
        processed_items = []
        total_item_size = 0
        for i, item in enumerate(items):
            item_image_base64 = item.get("image_base64", "")
            if not item_image_base64:
                logger.warning(f"⚠️ Item {i+1} missing image_base64, skipping")
                continue
            
            # Determine MIME type and clean base64
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
            
            item_size = len(item_image_base64) / 1024 / 1024  # MB
            total_item_size += item_size
            
            processed_items.append({
                **item,
                "image_base64": item_image_base64,
                "mime_type": item_mime
            })
        
        if not processed_items:
            logger.error("❌ No valid item images found")
            return None
        
        mime_elapsed = time.time() - mime_start
        elapsed = time.time() - function_start
        
        # Log base64 sizes
        user_b64_size = len(user_image_base64) / 1024 / 1024  # MB
        print(f"📊 [{elapsed:.1f}s] Base64 sizes - User: {user_b64_size:.2f}MB, Items: {total_item_size:.2f}MB total ({len(processed_items)} items)")
        logger.info(f"📊 [{elapsed:.1f}s] Base64 sizes - User: {user_b64_size:.2f}MB, Items: {total_item_size:.2f}MB total ({len(processed_items)} items)")
        
        # Build item descriptions for prompt
        item_descriptions = []
        for item in processed_items:
            category = item.get("category", "item")
            colors = item.get("colors", [])
            colors_text = ", ".join(colors) if colors else "original colors"
            item_descriptions.append(f"- {category} in {colors_text}")
        
        items_text = "\n".join(item_descriptions)
        
        # Use custom prompt if provided, otherwise use professional stylist default
        if custom_prompt:
            prompt = custom_prompt
        else:
            # Professional stylist prompt - understands fashion but preserves user's natural appearance
            bg_cmd = "Replace background with clean minimalist gradient/studio backdrop" if use_clean_background else "Keep original background"
            
            # Build prompts with professional stylist context (better understanding, still preserves user)
            if len(processed_items) == 1:
                item = processed_items[0]
                category = item.get("category", "item")
                colors = item.get("colors", [])
                colors_text = ", ".join(colors) if colors else "original colors"

                prompt = f"""You are a professional fashion stylist creating a virtual try-on. Person wearing {category} in {colors_text}.

CRITICAL: Keep face, body shape, pose, and all non-clothing features identical.

REQUIREMENTS:
- Fit {category} naturally on body, match colors exactly ({colors_text})
- Realistic lighting, shadows, fabric draping
- {bg_cmd}
- Preserve person's actual appearance and style (don't change their natural look)

Output: photorealistic image with person wearing {category}. Face must match original exactly."""
            else:
                prompt = f"""You are a professional fashion stylist creating a virtual try-on. Person wearing complete outfit:
{items_text}

CRITICAL: Keep face, body shape, pose, and all non-clothing features identical.

REQUIREMENTS:
- Fit all items naturally on body, match colors exactly
- Layer correctly (top over bottom, outerwear over items)
- Realistic lighting/shadows for all items
- {bg_cmd}
- Preserve person's actual appearance and style (don't change their natural look)

Output: photorealistic image with person wearing complete outfit. Face must match original exactly."""

        # Build payload parts: text prompt + user image + all item images
        # Reference: Gemini API supports multiple images in a single request
        # See: https://ai.google.dev/gemini-api/docs/guides/multimodal
        parts = [{"text": prompt}]
        
        # Add user image
        parts.append({
            "inlineData": {
                "mimeType": user_mime,
                "data": user_image_base64
            }
        })
        
        # Add all item images
        for item in processed_items:
            parts.append({
                "inlineData": {
                    "mimeType": item["mime_type"],
                    "data": item["image_base64"]
                }
            })
        
        payload = {
            "contents": [{
                "parts": parts
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
        
        # Retry Gemini call to mitigate transient DNS/network hiccups
        result = None
        last_exc = None
        for attempt in range(3):
            try:
                async with httpx.AsyncClient(timeout=90.0) as client:
                    response = await client.post(api_url, headers=headers, json=payload)
                    response.raise_for_status()
                    result = response.json()
                    last_exc = None
                    break
            except (httpx.ConnectError, httpx.ReadTimeout, httpx.HTTPError) as e:
                last_exc = e
                wait_s = 1.5 * (attempt + 1)
                logger.warning(f"Gemini call attempt {attempt+1} failed: {e}. Retrying in {wait_s:.1f}s...")
                await asyncio.sleep(wait_s)
        if last_exc is not None:
            raise last_exc
        
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

