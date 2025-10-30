import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Image, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomHeader } from '@/components/home/CustomHeader';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useCreateWardrobeItem, useUpdateWardrobeItem, useWardrobeItem, useWardrobeItemWithPolling, useProcessImage, useDeleteWardrobeItem } from '@/hooks/useWardrobe';
import { useUser } from '@/hooks/useAuthQuery';
import { useLocalSearchParams } from 'expo-router';
import { ShimmerPlaceholder } from '@/components/ShimmerPlaceholder';

interface WardrobeItemForm {
  title: string;
  category: string;
  colors: string[];
  tags: string[];
  imageUrl: string | null;
}

/**
 * AI Processing Stages
 * Each stage has its own Lottie animation and message
 */
type ProcessingStage = 'uploading' | 'analyzing' | 'enhancing' | 'extracting' | 'complete' | null;

interface ProcessingStageConfig {
  message: string;
  lottieSource: any; // Will be require() path
  duration: number; // Expected duration in ms
}

const categories = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'dress', label: 'Dress' },
  { value: 'shoe', label: 'Shoe' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'underwear', label: 'Underwear' },
];

const commonColors = [
  'black', 'white', 'navy', 'gray', 'beige', 'brown', 
  'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange'
];

/**
 * Processing stage configurations
 * Maps each stage to its message and expected duration
 */
const processingStageConfig: Record<Exclude<ProcessingStage, null>, ProcessingStageConfig> = {
  uploading: {
    message: 'Uploading image...',
    lottieSource: require('@/assets/images/partial-react-logo.png'), // Placeholder - will use simple animation
    duration: 1000,
  },
  analyzing: {
    message: 'AI analyzing your item...',
    lottieSource: require('@/assets/images/partial-react-logo.png'),
    duration: 4000,
  },
  enhancing: {
    message: 'Enhancing background...',
    lottieSource: require('@/assets/images/partial-react-logo.png'),
    duration: 3000,
  },
  extracting: {
    message: 'Extracting colors & details...',
    lottieSource: require('@/assets/images/partial-react-logo.png'),
    duration: 2000,
  },
  complete: {
    message: '✓ Ready!',
    lottieSource: require('@/assets/images/partial-react-logo.png'),
    duration: 500,
  },
};

// Helper function to convert image URI to base64 (same as profile completion)
const convertImageToBase64 = async (imageUri: string): Promise<string> => {
  console.log('🔄 Converting image to base64:', imageUri.substring(0, 50));
  const startTime = Date.now();
  
  try {
    // If it's already a data URL or external URL, return as is
    if (imageUri.startsWith('data:') || imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
      console.log('🔄 Image is already base64 or external URL, skipping conversion');
      return imageUri;
    }

    // Use ImageManipulator to convert to base64 (handles local files properly)
    console.log('🔄 Converting with ImageManipulator...');
    const readStart = Date.now();
    
    const { base64 } = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }], // Resize to 800px max width for faster AI processing
      { compress: 0.7, base64: true, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    console.log(`⏱️ Conversion took: ${Date.now() - readStart}ms`);
    
    if (!base64) {
      throw new Error('Failed to get base64 from ImageManipulator');
    }
    
    // Determine content type based on file extension
    const extension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const contentType = extension === 'png' ? 'image/png' : 'image/jpeg';
    
    const dataUri = `data:${contentType};base64,${base64}`;
    const totalTime = Date.now() - startTime;
    console.log(`✅ Conversion complete! Total time: ${totalTime}ms, Base64 length: ${dataUri.length}`);
    
    return dataUri;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

export default function AddItemScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'tabIconDefault');

  // Get current user and mutations
  const { data: user } = useUser();
  const createMutation = useCreateWardrobeItem();
  const updateMutation = useUpdateWardrobeItem();
  const deleteMutation = useDeleteWardrobeItem();  // 🗑️ For cleanup
  const processImageMutation = useProcessImage();  // 🎨 NEW
  
  // Check if we're in edit mode
  const params = useLocalSearchParams<{ itemId?: string }>();
  const isEditMode = !!params.itemId;
  const itemId = params.itemId ? parseInt(params.itemId) : 0;
  
  // Fetch existing item if editing
  const { data: existingItem, isLoading: isLoadingItem } = useWardrobeItem(itemId, user?.id || 0);

  const [formData, setFormData] = useState<WardrobeItemForm>({
    title: '',
    category: 'top',
    colors: [],
    tags: [],
    imageUrl: null,
  });

  const [selectedCategory, setSelectedCategory] = useState('top');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // 🎨 NEW: AI Processing state (processes BEFORE save)
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [isProcessingLocally, setIsProcessingLocally] = useState(false); // 🎨 Immediate UI feedback
  const [processingStage, setProcessingStage] = useState<ProcessingStage>(null); // 🎨 Current AI stage
  const [showShimmer, setShowShimmer] = useState(false); // 🎨 Control shimmer visibility
  
  // Use ref to track interval and prevent multiple creations
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // 🎨 Poll for AI processing updates immediately after image upload
  const { data: processingItem } = useWardrobeItemWithPolling(
    processingId || 0,
    user?.id || 0
  );
  
  // Memoize form emptiness check to avoid triggering effects on every keystroke
  const isFormEmpty = React.useMemo(() => 
    !formData.title && selectedColors.length === 0 && selectedTags.length === 0,
    [formData.title, selectedColors.length, selectedTags.length]
  );
  
  // 🎨 Auto-progress through processing stages based on backend status
  useEffect(() => {
    if (!isProcessingLocally) {
      // Clear interval if processing stopped
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
      return;
    }
    
    // Map backend status to frontend stage
    const backendStatus = processingItem?.processing_status;
    
    if (backendStatus === 'pending') {
      setProcessingStage('uploading');
      setShowShimmer(true);
      // Clear any existing interval
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
    } else if (backendStatus === 'processing') {
      // Only create interval if not already cycling
      if (cycleIntervalRef.current) return;
      
      // Cycle through analyzing → enhancing → extracting while backend processes
      const processingStages: Exclude<ProcessingStage, 'uploading' | 'complete' | null>[] = [
        'analyzing',
        'enhancing', 
        'extracting',
      ];
      
      let currentIndex = 0;
      setProcessingStage(processingStages[0]);
      setShowShimmer(true);
      
      cycleIntervalRef.current = setInterval(() => {
        currentIndex = (currentIndex + 1) % processingStages.length;
        setProcessingStage(processingStages[currentIndex]);
        console.log(`🎨 DEBUG: Cycling stage: ${processingStages[currentIndex]}`);
      }, 5000); // Change stage every 5s while processing
    }
    
    // Cleanup on unmount
    return () => {
      if (cycleIntervalRef.current) {
        clearInterval(cycleIntervalRef.current);
        cycleIntervalRef.current = null;
      }
    };
  }, [isProcessingLocally, processingItem?.processing_status]);
  
  // Load existing item data when editing
  React.useEffect(() => {
    if (isEditMode && existingItem) {
      // Map backend category to UI category
      const categoryMap: Record<string, string> = {
        'top': 'top',
        'bottom': 'bottom',
        'outerwear': 'outerwear',
        'dress': 'dress',
        'shoes': 'shoe',
        'accessories': 'accessory',
        'underwear': 'underwear',
      };
      
      const uiCategory = categoryMap[existingItem.category] || existingItem.category;
      
      setFormData({
        title: existingItem.title,
        category: uiCategory,
        colors: existingItem.colors || [],
        tags: existingItem.tags || [],
        imageUrl: existingItem.image_original || existingItem.image_clean || null,
      });
      
      setSelectedCategory(uiCategory);
      setSelectedColors(existingItem.colors || []);
      setSelectedTags(existingItem.tags || []);
    }
  }, [isEditMode, existingItem]);

  // 🎨 Auto-fill AI suggestions when processing completes (NEW: flexible categories)
  React.useEffect(() => {
    // ✅ GUARD: Only process if this is the CURRENT processing item (not an old one)
    if (!processingId || processingItem?.id !== processingId) {
      return;
    }
    
    if (processingItem?.processing_status === 'completed' && processingItem.ai_suggestions) {
      console.log('🎨 DEBUG: AI suggestions received for item', processingItem.id, ':', processingItem.ai_suggestions);
      
      // Only auto-fill if form is still empty (using memoized value)
      if (isFormEmpty) {
        const suggestions = processingItem.ai_suggestions;
        
        // 🎨 Use Gemini's flexible category directly
        setFormData(prev => ({
          ...prev,
          title: suggestions.title,
          category: suggestions.category,  // e.g., "denim jacket", "chinos", "sneaker"
          colors: suggestions.colors,
          tags: suggestions.tags,
        }));
        
        // Show category in text input
        setSelectedCategory(suggestions.category);
        setSelectedColors(suggestions.colors);
        setSelectedTags(suggestions.tags);
        setShowAISuggestions(true);
        
        console.log('🎨 DEBUG: Form auto-filled with category:', suggestions.category);
      }
      
      // Update the displayed image to the cleaned version
      if (processingItem.image_clean) {
        console.log('🎨 DEBUG: Updating to cleaned image:', processingItem.image_clean);
        setFormData(prev => ({
          ...prev,
          imageUrl: processingItem.image_clean || prev.imageUrl,
        }));
      }
      
      // 🎨 Show completion stage briefly, then turn off
      setProcessingStage('complete');
      setTimeout(() => {
        setIsProcessingLocally(false);
        setShowShimmer(false);
        setProcessingStage(null);
      }, processingStageConfig.complete.duration);
    }
  }, [processingId, processingItem?.id, processingItem?.processing_status, processingItem?.ai_suggestions, processingItem?.image_clean, isFormEmpty]);

  // 🗑️ Helper: Remove photo and reset all state
  const handleRemovePhoto = () => {
    console.log('🗑️ DEBUG: Removing photo and resetting form');
    
    // 🛑 Stop all processing
    setProcessingId(null);
    setIsProcessingLocally(false);
    setShowShimmer(false);
    setProcessingStage(null);
    setShowAISuggestions(false);
    
    // 🧹 Clear all form data
    setFormData({
      title: '',
      category: '',
      imageUrl: null,
      colors: [],
      tags: [],
    });
    setSelectedColors([]);
    setSelectedTags([]);
    setSelectedCategory('');
    
    console.log('✅ DEBUG: Photo removed, form reset complete');
  };

  // 🎨 Helper: Process image immediately after selection
  const processImageImmediately = async (imageUri: string) => {
    // Guard: Prevent duplicate processing
    if (isProcessingLocally) {
      console.log('🎨 DEBUG: Already processing, skipping duplicate call');
      return;
    }
    
    try {
      console.log('🎨 DEBUG: Processing image immediately:', imageUri);
      
      // 🎨 Show processing indicator IMMEDIATELY (before any async operations)
      setIsProcessingLocally(true);
      setShowShimmer(true);
      setProcessingStage('uploading');
      setShowAISuggestions(false); // 🧹 Clear AI suggestions badge
      
      // 🧹 Clear previous form data AND set new image immediately
      setFormData({
        title: '',
        category: '',
        imageUrl: imageUri, // ✅ Show new image immediately
        colors: [],
        tags: [],
      });
      setSelectedColors([]);
      setSelectedTags([]);
      setSelectedCategory('');
      
      console.log('🎨 DEBUG: New image set, form cleared');
      
      // Convert to base64
      console.log('🎨 DEBUG: Starting image conversion...');
      const imageData = await convertImageToBase64(imageUri);
      console.log('🎨 DEBUG: Image conversion complete');
      
      if (!imageData) {
        throw new Error('Failed to convert image to base64');
      }
      
      // Send to backend for AI processing
      if (user?.id) {
        console.log('🎨 DEBUG: Sending to backend for AI processing');
        const result = await processImageMutation.mutateAsync({
          userId: user.id,
          image: imageData,
        });
        
        console.log('🎨 DEBUG: Processing started with ID:', result.processing_id);
        setProcessingId(result.processing_id);  // Start polling
        // Keep isProcessingLocally true - will turn off when AI completes
      }
    } catch (error) {
      console.error('🎨 ERROR: Failed to process image:', error);
      console.error('🎨 ERROR: Error type:', error instanceof Error ? error.message : String(error));
      setIsProcessingLocally(false);
      setShowShimmer(false);
      setProcessingStage(null);
      
      // Show error to user
      Alert.alert(
        'Processing Error', 
        'Failed to process image with AI. You can still add the item manually.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleImageUpload = async () => {
    Alert.alert(
      'Add Item Photo',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take Photo',
          onPress: async () => {
            const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraStatus.status !== 'granted') {
              Alert.alert('Permission Required', 'Camera access is required to take photos.');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: false, // No editing - preserve original aspect ratio
              quality: 1, // Maximum quality
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              // 🎨 NEW: Process immediately
              await processImageImmediately(result.assets[0].uri);
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'Gallery access is required to select photos.');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: false, // No editing - preserve original aspect ratio
              quality: 1, // Maximum quality
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              // 🎨 NEW: Process immediately
              await processImageImmediately(result.assets[0].uri);
            }
          },
        },
      ]
    );
  };

  const handleToggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const handleAddTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Required', 'Please enter an item title');
      return;
    }

    if (!formData.imageUrl) {
      Alert.alert('Required', 'Please add an item photo');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'Please log in to add items');
      return;
    }

    try {
      // 🎨 Use the selected/AI category directly
      const backendCategory = selectedCategory || formData.category;

      // Convert image to base64 if we have an image
      let imageData = null;
      if (formData.imageUrl) {
        console.log('Converting image to base64...');
        imageData = await convertImageToBase64(formData.imageUrl);
        
        if (!imageData) {
          Alert.alert('Error', 'Failed to process image. Please try again.');
          return;
        }
      }

      console.log('Saving wardrobe item with image data length:', imageData?.length || 0);

      // Only send when we have a new base64 image (data URL)
      const shouldUpdateImage = typeof imageData === 'string' && imageData.startsWith('data:');
      
      const itemData: any = {
        title: formData.title,
        category: backendCategory,
        colors: selectedColors,
        tags: selectedTags,
      };
      
      // Only send image if it's new
      if (shouldUpdateImage) {
        itemData.image_original = imageData;
      }
      
      if (isEditMode) {
        // Update existing item
        await updateMutation.mutateAsync({
          userId: user.id,
          itemId: itemId,
          item: itemData,
        });
        
        Alert.alert(
          'Item Updated!',
          'Your wardrobe item has been updated successfully.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        // 🎨 NEW: Save wardrobe item (image already processed)
        console.log('🎨 DEBUG: Creating wardrobe item with user data...');
        
        // If we have a processingId, use that item's enhanced image
        let finalImageData = imageData;
        if (processingId && processingItem?.image_clean) {
          console.log('🎨 DEBUG: Using AI-enhanced image');
          // Convert enhanced S3 URL to data URL format expected by backend
          // Actually, we don't need to - backend will handle S3 URLs
          finalImageData = imageData; // Keep original for now
        }
        
        const newItem = await createMutation.mutateAsync({
          userId: user.id,
          item: {
            ...itemData,
            image_original: finalImageData,
          },
        });
        
        console.log('🎨 DEBUG: Item saved to wardrobe with ID:', newItem.id);
        
        // 🗑️ Delete temporary processing item if it exists
        if (processingId) {
          const tempId = processingId;
          console.log('🗑️ DEBUG: Stopping polling and deleting temporary item:', tempId);
          
          // 🛑 STOP POLLING IMMEDIATELY - Disable the polling query
          setProcessingId(null);
          
          // 🗑️ Delete in background without blocking the success flow
          deleteMutation.mutate(
            {
              userId: user.id,
              itemId: tempId,
            },
            {
              onSuccess: () => {
                console.log('🗑️ DEBUG: Temporary item deleted successfully');
              },
              onError: (deleteError) => {
                console.warn('⚠️ Failed to delete temporary processing item:', deleteError);
              },
            }
          );
        }
        
        Alert.alert(
          '✨ Item Added!',
          'Your wardrobe item has been saved successfully.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    }
  };

  const renderColorButton = (color: string) => (
    <TouchableOpacity
      key={color}
      style={[
        styles.colorButton,
        {
          backgroundColor: selectedColors.includes(color) 
            ? tintColor 
            : `${borderColor}33`,
          borderColor: selectedColors.includes(color) ? tintColor : borderColor,
        },
      ]}
      onPress={() => handleToggleColor(color)}
    >
      <ThemedText
        style={[
          styles.colorButtonText,
          { color: selectedColors.includes(color) ? 'white' : textColor },
        ]}
      >
        {color}
      </ThemedText>
    </TouchableOpacity>
  );

  // Show loading state when fetching existing item
  if (isEditMode && (!user?.id || isLoadingItem)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader
          title="Edit Item"
          showBackButton={true}
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading item...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title={isEditMode ? "Edit Item" : "Add Item"}
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Photo Upload Section */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Item Photo *
          </ThemedText>
          
          <TouchableOpacity
            style={[styles.imageUploadButton, { borderColor }]}
            onPress={handleImageUpload}
          >
            {formData.imageUrl ? (
              <Image source={{ uri: formData.imageUrl }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <IconSymbol name="camera.fill" size={48} color={borderColor} />
                <ThemedText style={[styles.placeholderText, { color: borderColor }]}>
                  Tap to add photo
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
          
          {/* 🎨 AI Processing Section - Lottie + Message (below image, not overlay) */}
          {isProcessingLocally && processingStage && (
            <View style={styles.aiProcessingSection}>
              {/* Simple animated icon (placeholder for Lottie) */}
              <View style={styles.processingIconContainer}>
                <ThemedText style={styles.processingIcon}>
                  {processingStage === 'uploading' && '☁️'}
                  {processingStage === 'analyzing' && '🤖'}
                  {processingStage === 'enhancing' && '✨'}
                  {processingStage === 'extracting' && '🔍'}
                  {processingStage === 'complete' && '✓'}
                </ThemedText>
              </View>
              
              {/* Processing Message */}
              <ThemedText style={[styles.processingMessage, { color: tintColor }]}>
                {processingStageConfig[processingStage].message}
              </ThemedText>
            </View>
          )}
          
          {/* 🤖 AI Suggestions Badge */}
          {showAISuggestions && (
            <View style={[styles.aiSuggestionBadge, { backgroundColor: `${tintColor}20`, borderColor: tintColor }]}>
              <IconSymbol name="sparkles" size={16} color={tintColor} />
              <ThemedText style={[styles.aiSuggestionText, { color: tintColor }]}>
                AI suggestions applied
              </ThemedText>
            </View>
          )}
          
          {formData.imageUrl && (
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: tintColor }]}
              onPress={handleRemovePhoto}
            >
              <IconSymbol name="trash.fill" size={16} color="white" />
              <ThemedText style={styles.removeButtonText}>Remove Photo</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {/* Item Details Section */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Item Details *
          </ThemedText>
          
          {/* 🎨 Show shimmer during processing, real input after */}
          {showShimmer && !formData.title ? (
            <ShimmerPlaceholder width="80%" height={48} />
          ) : (
            <View style={[styles.inputContainer, { borderColor }]}>
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="e.g., White Cotton T-Shirt"
                placeholderTextColor={borderColor}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>
          )}
        </View>

        {/* Category Selection */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Category *
          </ThemedText>
          
          {/* 🎨 Show shimmer during processing, real input after */}
          {showShimmer && !selectedCategory ? (
            <ShimmerPlaceholder width="60%" height={48} style={{ marginBottom: 12 }} />
          ) : (
            <View style={[styles.inputContainer, { borderColor, marginBottom: 12 }]}>
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="e.g., denim jacket, cargo pants, sneakers"
                placeholderTextColor={borderColor}
                value={selectedCategory}
                onChangeText={setSelectedCategory}
              />
            </View>
          )}
          
          <ThemedText style={[styles.helperText, { color: borderColor, marginBottom: 8 }]}>
            Or select a quick option:
          </ThemedText>
          
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === cat.value ? tintColor : `${borderColor}33`,
                    borderColor: selectedCategory === cat.value ? tintColor : borderColor,
                  },
                ]}
                onPress={() => setSelectedCategory(cat.value)}
              >
                <ThemedText
                  style={[
                    styles.categoryButtonText,
                    { color: selectedCategory === cat.value ? 'white' : textColor },
                  ]}
                >
                  {cat.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Selection */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Colors
          </ThemedText>
          
          {/* 🎨 Show shimmer chips during processing */}
          {showShimmer && selectedColors.length === 0 ? (
            <View style={styles.shimmerRow}>
              <ShimmerPlaceholder width={70} height={32} borderRadius={16} />
              <ShimmerPlaceholder width={90} height={32} borderRadius={16} style={{ marginLeft: 8 }} />
              <ShimmerPlaceholder width={60} height={32} borderRadius={16} style={{ marginLeft: 8 }} />
            </View>
          ) : (
            <View style={styles.colorGrid}>
              {commonColors.map(renderColorButton)}
            </View>
          )}
        </View>

        {/* Tags Section */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Tags
          </ThemedText>
          
          {/* 🎨 Show shimmer chips during processing */}
          {showShimmer && selectedTags.length === 0 ? (
            <View style={styles.shimmerRow}>
              <ShimmerPlaceholder width={60} height={30} borderRadius={15} />
              <ShimmerPlaceholder width={80} height={30} borderRadius={15} style={{ marginLeft: 8 }} />
              <ShimmerPlaceholder width={70} height={30} borderRadius={15} style={{ marginLeft: 8 }} />
              <ShimmerPlaceholder width={65} height={30} borderRadius={15} style={{ marginLeft: 8 }} />
            </View>
          ) : (
            <>
              <View style={[styles.tagInputContainer, { borderColor }]}>
                <TextInput
                  style={[styles.tagInput, { color: textColor }]}
                  placeholder="Add a tag (e.g., casual, formal, summer)"
                  placeholderTextColor={borderColor}
                  value={customTag}
                  onChangeText={setCustomTag}
                  onSubmitEditing={handleAddTag}
                />
                <TouchableOpacity
                  style={[styles.addTagButton, { backgroundColor: tintColor }]}
                  onPress={handleAddTag}
                >
                  <IconSymbol name="plus" size={16} color="white" />
                </TouchableOpacity>
              </View>
              
              {selectedTags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {selectedTags.map((tag) => (
                    <View key={tag} style={[styles.tagChip, { backgroundColor: `${tintColor}33`, borderColor: tintColor }]}>
                      <ThemedText style={[styles.tagText, { color: tintColor }]}>{tag}</ThemedText>
                      <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                        <IconSymbol name="xmark.circle.fill" size={16} color={tintColor} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: tintColor, opacity: (createMutation.isPending || updateMutation.isPending) ? 0.6 : 1 }]}
          onPress={handleSave}
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {(createMutation.isPending || updateMutation.isPending) ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.saveButtonText}>
              {isEditMode ? 'Update Item' : 'Add to Wardrobe'}
            </ThemedText>
          )}
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  helperText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  imageUploadButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // 🤖 AI Processing Styles
  processingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingBar: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    opacity: 0.95,
  },
  processingText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  // 🎨 New AI Processing Section (below image, not overlay)
  aiProcessingSection: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  processingIconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingIcon: {
    fontSize: 32,
  },
  processingMessage: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  // 🎨 Shimmer Row for Colors & Tags
  shimmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: 8,
  },
  aiSuggestionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  aiSuggestionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    fontSize: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorButtonText: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
  tagInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  tagInput: {
    flex: 1,
    fontSize: 14,
  },
  addTagButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  tagText: {
    fontSize: 14,
  },
  saveButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});

