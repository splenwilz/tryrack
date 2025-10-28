# Gemini AI Background Removal Integration

## Overview

This integration uses Google's Gemini 2.5 Flash Image model (aka "Nano Banana") to automatically remove backgrounds from wardrobe item images, creating professional product photos with clean white backgrounds.

## Architecture

```
Frontend Upload → Backend API → Gemini AI → S3 Storage
                     ↓                          ↓
               image_original            image_clean
```

## Implementation Details

### 1. Configuration (`backend/app/core/config.py`)

Added `GEMINI_API_KEY` to settings:

```python
# Gemini API Configuration
GEMINI_API_KEY: Optional[str] = None
```

### 2. Gemini Service (`backend/app/services/gemini_service.py`)

Clean, modular service for background removal:

- **Function**: `remove_background(image_base64: str) -> Optional[str]`
- **Model**: `gemini-2.5-flash-image`
- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent`
- **Prompt**: "Remove the background from this clothing item and replace it with a clean white background. Keep the item exactly as it is, only change the background to pure white."
- **Timeout**: 60 seconds
- **Returns**: Base64 data URL with cleaned image or None

### 3. API Integration (`backend/app/api/wardrobe.py`)

Modified POST endpoint workflow:

1. Upload original image to S3 → `image_original`
2. If `GEMINI_API_KEY` configured:
   - Send to Gemini for background removal
   - Upload cleaned image to S3 → `image_clean`
3. Return both URLs to frontend

**Graceful Degradation**: If Gemini is unavailable or not configured, only `image_original` is stored.

## Configuration

### Environment Variables

Add to your `backend/.env` file:

```bash
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: https://aistudio.google.com/app/apikey

### Required Dependencies

Already included in `pyproject.toml`:
- `httpx>=0.25.0` - For async HTTP requests to Gemini API

## Usage

### From Frontend

No changes required! The existing wardrobe upload flow automatically uses Gemini:

```typescript
await createMutation.mutateAsync({
  userId: user.id,
  item: {
    title: "Blue Shirt",
    category: "top",
    image_original: "data:image/jpeg;base64,..."
  }
});
```

### API Response

```json
{
  "id": 8,
  "title": "Blue Shirt",
  "image_original": "https://bucket.s3.amazonaws.com/.../item_123_original.jpg",
  "image_clean": "https://bucket.s3.amazonaws.com/.../item_123_clean.png",
  "status": "clean",
  ...
}
```

### Testing with cURL

```bash
# Test with base64 image
curl -X POST "http://localhost:8000/api/v1/wardrobe/?user_id=4" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Item",
    "category": "top",
    "colors": ["blue"],
    "image_original": "data:image/jpeg;base64,/9j/4AAQ..."
  }'
```

## Performance

- **Latency**: ~10-15 seconds per image (Gemini processing)
- **Cost**: $30 per 1M tokens (1 image ≈ 1290 tokens = ~$0.039/image)
- **Optimization**: Process runs in background, doesn't block API response

## Error Handling

The implementation includes comprehensive error handling:

1. **No API Key**: Logs warning, skips background removal
2. **HTTP Errors**: Logs error, returns None (original image still saved)
3. **Timeout**: 60-second timeout prevents hanging
4. **Invalid Response**: Validates Gemini response structure

## Monitoring

Check logs for Gemini processing:

```bash
# Success
INFO: Processing image with Gemini for background removal
INFO: Background removed successfully via Gemini
INFO: Cleaned image uploaded to S3: https://...

# Skipped (no API key)
INFO: Gemini API key not configured, skipping background removal

# Failure
WARNING: Gemini background removal returned no image
ERROR: HTTP error during background removal: ...
```

## Best Practices

1. **Image Quality**: Use high-quality input images (min 512px)
2. **File Size**: Keep under 20MB for optimal performance
3. **Format**: JPEG/PNG supported, Gemini outputs PNG
4. **Rate Limits**: Gemini has rate limits, implement retry logic if needed

## Future Enhancements

- [ ] Add retry logic for transient failures
- [ ] Implement queue for batch processing
- [ ] Add progress tracking for long operations
- [ ] Support different background colors/styles
- [ ] Cache cleaned images to avoid reprocessing

## References

- [Gemini Image Generation Docs](https://ai.google.dev/gemini-api/docs/image-generation#python)
- Gemini API Pricing: https://ai.google.dev/pricing
- Model: `gemini-2.5-flash-image`

