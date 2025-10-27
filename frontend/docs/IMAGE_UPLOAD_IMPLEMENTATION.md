# Image Upload Implementation

## Overview

The profile completion screen now supports real photo upload from camera or gallery using Expo ImagePicker.

## Features

### 1. **Profile Photo Upload**
- Take photo with camera (1:1 aspect ratio)
- Choose from gallery (1:1 aspect ratio)
- Automatic cropping/editing
- Quality set to 80% for optimal file size

### 2. **Full Body Photo Upload**
- Take photo with camera (3:4 aspect ratio - portrait)
- Choose from gallery (3:4 aspect ratio)
- Automatic cropping/editing
- Quality set to 80% for optimal file size

## Permissions

The app requests the following permissions:
- **Media Library**: To access photo gallery
- **Camera**: To take photos

Permissions are requested dynamically when needed.

## User Flow

1. User taps on photo placeholder
2. Alert shows two options: "Take Photo" or "Choose from Gallery"
3. **Take Photo**: 
   - Requests camera permission
   - Launches camera with crop editor
   - Saves image URI to form state
4. **Choose from Gallery**:
   - Requests media library permission
   - Opens image picker with crop editor
   - Saves image URI to form state

## Image Storage

Currently, images are stored locally as URIs in the app state. When saved:
- Image URIs are sent to the backend in the profile completion request
- Backend should store these images (e.g., S3, Cloud Storage)
- Backend returns URLs that are stored in the user profile

## Implementation Details

### Image Picker Configuration

```typescript
// Profile photo - Square (1:1)
aspect: [1, 1],
quality: 0.8,

// Full body photo - Portrait (3:4)
aspect: [3, 4],
quality: 0.8,
```

### Code Location

**File**: `frontend/app/profile-completion.tsx`
**Function**: `handleImageUpload(isProfilePhoto: boolean)`

### Dependencies

- `expo-image-picker` (already installed in package.json)

## Next Steps (Future Enhancements)

1. **Upload to backend**: Upload images to backend storage before saving profile
2. **Image compression**: Further optimize images before upload
3. **Progress indicator**: Show upload progress
4. **Error handling**: Better error messages for upload failures
5. **Image preview**: Show selected image before upload
6. **Multiple images**: Support multiple full-body photos

## Usage

Users can now:
1. Open profile completion screen
2. Tap on profile photo or full body photo placeholders
3. Choose camera or gallery
4. Take/select and crop image
5. Image appears in the form
6. Save profile with images

## Testing

Test on real devices as camera/gallery require device permissions:
- iOS: Test on physical iPhone
- Android: Test on physical Android device
- Simulator: Gallery works, camera doesn't

