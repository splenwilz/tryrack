import { StyleSheet, View, TouchableOpacity, Image, Alert, ScrollView, Dimensions, ActivityIndicator, Animated, Easing, Share, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
// Use legacy API to access cacheDirectory and downloadAsync consistently
import * as FileSystem from 'expo-file-system/legacy';
import { useUser } from '@/hooks/useAuthQuery';
import { useGenerateVirtualTryOn, useVirtualTryOnResult, convertImageToBase64, useTryOnSuggestions, ItemDetails } from '@/hooks/useVirtualTryOn';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// Boutique item interface (same as in other files)
interface BoutiqueItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  imageUrl: string;
  price: number;
  colors: string[];
  tags: string[];
  boutique: {
    id: string;
    name: string;
    logo: string;
  };
  arAvailable: boolean;
}

// Wardrobe item interface
interface WardrobeItemTryOn {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  colors: string[];
  tags: string[];
}

// Mock boutique data (same as in explore.tsx)
const mockBoutiqueData: BoutiqueItem[] = [
  {
    id: '1',
    title: 'Designer Blazer',
    brand: 'Fashion Forward',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=300&h=400&fit=crop',
    price: 45000,
    colors: ['navy', 'black'],
    tags: ['formal', 'business'],
    boutique: {
      id: 'b1',
      name: 'Luxe Boutique',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '2',
    title: 'Silk Evening Dress',
    brand: 'Elegance Co',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
    price: 75000,
    colors: ['black', 'navy'],
    tags: ['elegant', 'formal'],
    boutique: {
      id: 'b2',
      name: 'Elegance Co',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '3',
    title: 'Summer Maxi Dress',
    brand: 'Casual Chic',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0c29b8b0b8c?w=300&h=400&fit=crop',
    price: 35000,
    colors: ['blue', 'pink'],
    tags: ['casual', 'summer'],
    boutique: {
      id: 'b3',
      name: 'Casual Chic',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '4',
    title: 'Cocktail Dress',
    brand: 'Party Perfect',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0c29b8b0b8c?w=300&h=400&fit=crop',
    price: 55000,
    colors: ['red', 'black'],
    tags: ['party', 'cocktail'],
    boutique: {
      id: 'b4',
      name: 'Party Perfect',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '5',
    title: 'Designer Handbag',
    brand: 'Luxury Accessories',
    category: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
    price: 120000,
    colors: ['black', 'brown'],
    tags: ['luxury', 'designer'],
    boutique: {
      id: 'b5',
      name: 'Luxury Accessories',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: false
  },
  {
    id: '6',
    title: 'Leather Jacket',
    brand: 'Urban Style',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
    price: 85000,
    colors: ['black', 'brown'],
    tags: ['leather', 'urban'],
    boutique: {
      id: 'b6',
      name: 'Urban Style',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  }
];

const { width: screenWidth } = Dimensions.get('window');

/**
 * Virtual Try-On Screen Component
 * Allows users to virtually try on clothing items using Gemini's image generation capabilities
 * Combines user photo with product image to create fitted virtual try-on result
 */
export default function VirtualTryOnScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const { itemId, itemType, itemData } = useLocalSearchParams<{ itemId: string; itemType?: string; itemData?: string }>();
  
  // Get current user to check for existing full body photo
  const { data: user } = useUser();
  
  // Multi-item support: selectedItems array (backward compatible with selectedItem)
  const [selectedItems, setSelectedItems] = useState<(BoutiqueItem | WardrobeItemTryOn)[]>([]);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [hasUsedExistingPhoto, setHasUsedExistingPhoto] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [tryonId, setTryonId] = useState<number | null>(null);
  const [useCleanBackground, setUseCleanBackground] = useState(false); // Toggle for clean background
  const [customPrompt, setCustomPrompt] = useState<string>(''); // User-editable custom prompt
  const [showPromptEditor, setShowPromptEditor] = useState(false); // Toggle prompt editor visibility
  const TARGET_WIDTH = 640;
  const COMPRESS_QUALITY = 0.6;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // API hooks
  const generateMutation = useGenerateVirtualTryOn();
  const { data: tryonResult } = useVirtualTryOnResult(
    tryonId,
    user?.id ?? 0,
    tryonId !== null
  );
  
  // Backward compatibility: use first item for UI display (legacy code references)
  const selectedItem = selectedItems[0] || null;
  
  // Suggestions: fetch compatible items when first item is selected
  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useTryOnSuggestions(
    selectedItem?.category || null,
    selectedItem?.colors || null,
    user?.id ?? 0,
    !!selectedItem && user?.id ? true : false
  );
  
  // Debug suggestions
  useEffect(() => {
    if (__DEV__ && selectedItem) {
      console.log('🔍 Suggestions Debug:', {
        category: selectedItem.category,
        colors: selectedItem.colors,
        userId: user?.id,
        suggestionsData,
        isLoading: isLoadingSuggestions
      });
    }
  }, [selectedItem, suggestionsData, isLoadingSuggestions, user?.id]);

  // Find the selected item and initialize selectedItems array
  useEffect(() => {
    let initialItem: BoutiqueItem | WardrobeItemTryOn | null = null;
    
    if (itemType === 'wardrobe' && itemData) {
      // Parse wardrobe item data
      try {
        const parsedData = JSON.parse(itemData);
        initialItem = parsedData;
      } catch (error) {
        console.error('Error parsing wardrobe item data:', error);
      }
    } else if (itemId) {
      // Find boutique item from mock data
      const item = mockBoutiqueData.find(item => item.id === itemId);
      initialItem = item || null;
    }
    
    // Initialize selectedItems with the first item
    if (initialItem) {
      setSelectedItems([initialItem]);
    } else {
      setSelectedItems([]);
    }
  }, [itemId, itemType, itemData]);

  // Initialize user photo from profile if available
  useEffect(() => {
    if (user?.full_body_image_url && !hasUsedExistingPhoto) {
      setUserPhoto(user.full_body_image_url);
    }
  }, [user, hasUsedExistingPhoto]);
  
  // Handle polling result updates
  useEffect(() => {
    if (!tryonResult) return;
    if (__DEV__) {
      console.log('📊 Try-on status:', tryonResult.status);
    }

    if (tryonResult.status === 'completed') {
      const url = tryonResult.result_image_url;
      const b64 = tryonResult.result_image_base64;
      if (url) {
        setGeneratedImage(url);
        setIsGenerating(false);
        Alert.alert('Success!', 'Virtual try-on generated successfully!');
      } else if (b64) {
        // Show base64 immediately; polling will continue until URL arrives
        setGeneratedImage(`data:image/png;base64,${b64}`);
        setIsGenerating(false);
      }
    } else if (tryonResult.status === 'failed') {
      setIsGenerating(false);
      Alert.alert('Generation Failed', tryonResult.error_message || 'Failed to generate virtual try-on. Please try again.');
    } else if (tryonResult.status === 'processing') {
      setIsGenerating(true);
    }
  }, [tryonResult]);

  // Simple animated loader while generating
  useEffect(() => {
    if (isGenerating) {
      Animated.loop(
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        })
      ).start();
    } else {
      progressAnim.stopAnimation(() => progressAnim.setValue(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating, progressAnim]);

  const handleBackPress = () => {
    router.back();
  };

  // Helper functions for multi-item management
  const addItemToTryOn = (item: BoutiqueItem | WardrobeItemTryOn) => {
    // Check if item is already selected (infer type same way as in request payload)
    const isAlreadySelected = selectedItems.some((selected) => {
      const selectedType = 'boutique' in selected ? 'boutique' : 'wardrobe';
      const candidateType = 'boutique' in item ? 'boutique' : 'wardrobe';
      return selected.id === item.id && selectedType === candidateType;
    });
    
    if (isAlreadySelected) {
      Alert.alert('Already Selected', 'This item is already in your try-on list.');
      return;
    }
    
    // Limit to 5 items max
    if (selectedItems.length >= 5) {
      Alert.alert('Limit Reached', 'You can try on up to 5 items at once.');
      return;
    }
    
    setSelectedItems([...selectedItems, item]);
  };

  const removeItemFromTryOn = (itemId: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const handleUseExistingPhoto = () => {
    setHasUsedExistingPhoto(true);
    // Photo is already set in state
    Alert.alert('Photo Ready', 'Using your existing full body photo for virtual try-on');
  };

  const handleSelectNewPhoto = async () => {
    Alert.alert(
      'Select New Photo',
      'Choose how you\'d like to upload a new photo',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Take Photo', 
          onPress: async () => {
            try {
              const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
              
              if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Camera access is needed to take photos');
                return;
              }
              
              const result = await ImagePicker.launchCameraAsync({
                quality: 1,
                base64: false,
              });
              
              if (!result.canceled && result.assets[0]) {
                // Resize image to reduce size
                const manipulatedImage = await ImageManipulator.manipulateAsync(
                  result.assets[0].uri,
                  [{ resize: { width: TARGET_WIDTH } }],
                  { compress: COMPRESS_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
                );
                
                setUserPhoto(manipulatedImage.uri);
                setHasUsedExistingPhoto(true);
                Alert.alert('Photo Taken', 'Photo captured successfully!');
              }
            } catch (error) {
              console.error('Error taking photo:', error);
              Alert.alert('Error', 'Failed to take photo');
            }
          }
        },
        { 
          text: 'Choose from Gallery', 
          onPress: async () => {
            try {
              const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
              
              if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Photo library access is needed');
                return;
              }
              
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                base64: false,
              });
              
              if (!result.canceled && result.assets[0]) {
                // Resize image to reduce size
                const manipulatedImage = await ImageManipulator.manipulateAsync(
                  result.assets[0].uri,
                  [{ resize: { width: TARGET_WIDTH } }],
                  { compress: COMPRESS_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
                );
                
                setUserPhoto(manipulatedImage.uri);
                setHasUsedExistingPhoto(true);
                Alert.alert('Photo Selected', 'Photo selected from gallery!');
              }
            } catch (error) {
              console.error('Error selecting photo:', error);
              Alert.alert('Error', 'Failed to select photo');
            }
          }
        }
      ]
    );
  };

  const handleSelectPhoto = () => {
    if (user?.full_body_image_url && !hasUsedExistingPhoto) {
      // Show option to use existing or upload new
      Alert.alert(
        'Select Photo',
        'You have a saved full body photo. Would you like to use it or upload a new one?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Use Existing Photo', 
            onPress: handleUseExistingPhoto
          },
          { 
            text: 'Upload New Photo', 
            onPress: handleSelectNewPhoto
          }
        ]
      );
    } else {
      // No existing photo, go directly to upload
      handleSelectNewPhoto();
    }
  };

  async function toCompressedBase64(uri: string): Promise<string> {
    try {
      let localUri = uri;
      if (uri.startsWith('http')) {
        const cacheDir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || '';
        const download = await FileSystem.downloadAsync(uri, `${cacheDir}tryon_${Date.now()}.jpg`);
        localUri = download.uri;
      }
      const manipulated = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: TARGET_WIDTH } }],
        { compress: COMPRESS_QUALITY, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      // manipulated.base64 is without data URI prefix
      return manipulated.base64 || '';
    } catch (e) {
      // Fallback to non-compressed conversion
      return await convertImageToBase64(uri);
    }
  }

  const handleGenerateTryOn = async () => {
    if (selectedItems.length === 0 || !userPhoto || !user?.id) {
      Alert.alert('Missing Information', 'Please select at least one item and your photo to generate virtual try-on');
      return;
    }

    setIsGenerating(true);
    
    try {
      if (__DEV__) {
        console.log('🎨 Generating virtual try-on with Gemini API...');
        console.log('📦 Selected items:', selectedItems.length);
        selectedItems.forEach((item, idx) => {
          console.log(`   [${idx+1}] ${item.title} (${item.category})`);
        });
        console.log('📸 User photo URL:', userPhoto);
      }
      
      // Always send compressed base64 for user image
      const user_image_base64 = await toCompressedBase64(userPhoto);
      
      // Infer item type per item: boutique items have 'boutique' property, wardrobe items don't
      const inferItemType = (item: BoutiqueItem | WardrobeItemTryOn): 'wardrobe' | 'boutique' => {
        return 'boutique' in item ? 'boutique' : 'wardrobe';
      };
      
      // Prepare item_details array for multi-item support
      const item_details: ItemDetails[] = await Promise.all(
        selectedItems.map(async (item) => {
          return {
            category: item.category,
            colors: item.colors || [],
            type: inferItemType(item),
            item_id: item.id,
          };
        })
      );

      // For backward compatibility, also provide first item's image as base64
      const firstItem = selectedItems[0];
      const firstItemImageBase64 = firstItem.imageUrl 
        ? await toCompressedBase64(firstItem.imageUrl)
        : undefined;

      const request = {
        user_image_url: undefined,
        item_image_url: undefined, // Legacy field
        user_image_base64,
        item_image_base64: firstItemImageBase64, // Legacy: first item for backward compatibility
        item_details: item_details, // Always send as array (backend expects List[ItemDetails])
        use_clean_background: useCleanBackground,
        custom_prompt: customPrompt.trim() || undefined, // Include custom prompt if provided
      };
      
      if (__DEV__) {
        console.log('🚀 Sending request to backend...');
        console.log(`   Items: ${item_details.length} item(s)`);
      }
      
      // Call API to generate try-on
      const result = await generateMutation.mutateAsync({
        userId: user.id,
        request,
      });
      
      if (__DEV__) {
        console.log('✅ Try-on request created with ID:', result.id);
        console.log('📊 Status:', result.status);
      }
      
      // Start polling for result
      setTryonId(result.id);
      
      // The useEffect will handle the polling and status updates
      
    } catch (error: unknown) {
      console.error('❌ Error generating virtual try-on:', error);
      setIsGenerating(false);
      
      // Error handling
      let errorMessage = 'Failed to generate virtual try-on. Please try again.';
      if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorMessage = error.message;
        } else if ('response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
          const data = error.response.data;
          if (data && typeof data === 'object' && 'detail' in data && typeof data.detail === 'string') {
            errorMessage = data.detail;
          }
        }
      }
      Alert.alert('Generation Failed', errorMessage);
    }
  };

  const handleSaveResult = () => {
    Alert.alert('Save Result', 'Virtual try-on result saved to your gallery!');
  };

  const handleShareResult = async () => {
    try {
      if (!generatedImage) {
        Alert.alert('No Image', 'Generate a virtual try-on first.');
        return;
      }

      let uriToShare = generatedImage;
      // If base64, persist to a temp file and share the file URL
      if (generatedImage.startsWith('data:image')) {
        const b64 = generatedImage.split(',')[1] || '';
        const cacheDir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory || '';
        const tempPath = `${cacheDir}tryon_share_${Date.now()}.png`;
        await FileSystem.writeAsStringAsync(tempPath, b64, { encoding: (FileSystem as any).EncodingType?.Base64 || 'base64' });
        uriToShare = tempPath;
      }

      // Android: convert local file path to content:// URI so the target app can read
      let shareUrl = uriToShare;
      if (Platform.OS === 'android' && !uriToShare.startsWith('http')) {
        const toContent = (FileSystem as any).getContentUriAsync;
        if (typeof toContent === 'function') {
          shareUrl = await toContent(uriToShare);
        }
      }

      const message = `My TryRack virtual try-on ✨\n${shareUrl}`;
      await Share.share(
        Platform.OS === 'android'
          ? { message, title: 'TryRack' }
          : { url: shareUrl, message: 'My TryRack virtual try-on ✨', title: 'TryRack' }
      );
    } catch (e) {
      console.error('❌ Share failed:', e);
      Alert.alert('Share Failed', 'Could not share the image. Please try again.');
    }
  };

  if (!selectedItem) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader
          title="Virtual try-On"
          showBackButton={true}
          onBackPress={handleBackPress}
        />
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Item not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Virtual Try-On"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Selected Items Section - Multi-item support */}
        <View style={styles.productSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {selectedItems.length === 1 
              ? (itemType === 'wardrobe' ? 'Your Item' : 'Product')
              : `Items to Try On (${selectedItems.length})`
            }
          </ThemedText>
          
          {/* Display all selected items */}
          {selectedItems.map((item, index) => (
            <View key={`${item.id}-${index}`} style={[styles.productCard, { backgroundColor, marginBottom: 12 }]}>
              <View style={styles.productCardHeader}>
                <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                {selectedItems.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeItemButton}
                    onPress={() => removeItemFromTryOn(item.id)}
                  >
                    <IconSymbol name="xmark.circle.fill" size={20} color="#ff4444" />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.productInfo}>
                {'brand' in item && <ThemedText style={styles.brandName}>{item.brand}</ThemedText>}
                <ThemedText style={styles.productTitle}>{item.title}</ThemedText>
                {'price' in item && <ThemedText style={styles.price}>₦{item.price.toLocaleString()}</ThemedText>}
                {'colors' in item && item.colors && (
                  <View style={styles.colorsContainer}>
                    <ThemedText style={styles.colorsLabel}>Colors:</ThemedText>
                    <View style={styles.colorsList}>
                      {item.colors.map((color: string) => (
                        <View key={color} style={[styles.colorChip, { backgroundColor: tintColor }]}>
                          <ThemedText style={styles.colorText}>{color}</ThemedText>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Suggestions Section - Show compatible items from wardrobe */}
        {selectedItem && (
          <View style={styles.suggestionsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Compatible Items from Your Wardrobe
            </ThemedText>
            <ThemedText style={[styles.suggestionsSubtitle, { color: '#999' }]}>
              Add items to create a complete outfit
            </ThemedText>
            
            {isLoadingSuggestions ? (
              <ActivityIndicator size="small" color={tintColor} style={{ marginVertical: 20 }} />
            ) : suggestionsData && suggestionsData.suggestions && suggestionsData.suggestions.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.suggestionsScroll}
              >
                {suggestionsData.suggestions.map((suggestion) => (
                  <TouchableOpacity
                    key={suggestion.id}
                    style={[styles.suggestionCard, { backgroundColor }]}
                    onPress={() => {
                      // Convert suggestion to item format and add to try-on
                      const itemToAdd: WardrobeItemTryOn = {
                        id: suggestion.id.toString(),
                        title: suggestion.title,
                        category: suggestion.category,
                        imageUrl: suggestion.image_clean || suggestion.image_original || suggestion.imageUrl,
                        colors: suggestion.colors || [],
                        tags: suggestion.tags || [],
                      };
                      addItemToTryOn(itemToAdd);
                    }}
                  >
                    <Image 
                      source={{ uri: suggestion.image_clean || suggestion.image_original || suggestion.imageUrl }} 
                      style={styles.suggestionImage} 
                    />
                    <View style={styles.suggestionInfo}>
                      <ThemedText style={styles.suggestionTitle} numberOfLines={2}>
                        {suggestion.title}
                      </ThemedText>
                      <View style={styles.suggestionScore}>
                        <IconSymbol name="star.fill" size={12} color={tintColor} />
                        <ThemedText style={[styles.suggestionScoreText, { color: tintColor }]}>
                          {Math.round(suggestion.compatibility_score * 100)}% match
                        </ThemedText>
                      </View>
                      {suggestion.compatibility_reasons && suggestion.compatibility_reasons.length > 0 && (
                        <ThemedText style={[styles.suggestionReason, { color: '#999' }]} numberOfLines={1}>
                          {suggestion.compatibility_reasons[0]}
                        </ThemedText>
                      )}
                    </View>
                    <View style={[styles.addButton, { backgroundColor: tintColor }]}>
                      <IconSymbol name="plus" size={16} color="white" />
                      <ThemedText style={styles.addButtonText}>Add</ThemedText>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <ThemedText style={[styles.suggestionsSubtitle, { color: '#999', textAlign: 'center', marginVertical: 20 }]}>
                No compatible items found in your wardrobe. Add more items to get suggestions!
              </ThemedText>
            )}
          </View>
        )}

        {/* User Photo Section */}
        <View style={styles.photoSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Your Photo</ThemedText>
          
          {/* Show existing full body photo with option to use or replace */}
          {user?.full_body_image_url && userPhoto === user.full_body_image_url && !hasUsedExistingPhoto && (
            <View style={styles.existingPhotoContainer}>
              <View style={[styles.photoCard, { backgroundColor }]}>
                <Image source={{ uri: userPhoto }} style={styles.existingPhoto} />
                <View style={styles.existingPhotoInfo}>
                  <ThemedText style={styles.existingPhotoTitle}>Use your saved full body photo?</ThemedText>
                  <ThemedText style={styles.existingPhotoSubtext}>
                    We found your existing full body photo. You can use it or upload a new one.
                  </ThemedText>
                  <View style={styles.photoActionButtons}>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: `${tintColor}22` }]}
                      onPress={handleUseExistingPhoto}
                    >
                      <IconSymbol name="checkmark.circle.fill" size={16} color={tintColor} />
                      <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
                        Use This Photo
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: `${tintColor}22` }]}
                      onPress={handleSelectNewPhoto}
                    >
                      <IconSymbol name="camera.fill" size={16} color={tintColor} />
                      <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
                        Upload New
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Show selected photo */}
          {userPhoto && hasUsedExistingPhoto && (
            <TouchableOpacity style={[styles.photoButton, { backgroundColor }]} onPress={handleSelectPhoto}>
              <View style={styles.photoContainer}>
                <Image source={{ uri: userPhoto }} style={styles.userPhoto} />
                <TouchableOpacity 
                  style={styles.removePhotoButton} 
                  onPress={() => {
                    setUserPhoto(null);
                    setHasUsedExistingPhoto(false);
                  }}
                >
                  <IconSymbol name="plus" size={16} color="white" style={{ transform: [{ rotate: '45deg' }] }} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}

          {/* Show add photo button if no photo selected */}
          {!userPhoto && !user?.full_body_image_url && (
            <TouchableOpacity style={[styles.photoButton, { backgroundColor }]} onPress={handleSelectPhoto}>
              <View style={styles.photoPlaceholder}>
                <IconSymbol name="plus" size={32} color={iconColor} />
                <ThemedText style={styles.photoPlaceholderText}>Add Your Photo</ThemedText>
                <ThemedText style={styles.photoPlaceholderSubtext}>
                  Take a photo or choose from gallery
                </ThemedText>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Generate Button */}
        {/* Background Toggle */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <ThemedText style={styles.toggleLabel}>Clean Background</ThemedText>
              <ThemedText style={[styles.toggleSubtext, { color: '#999' }]}>
                {useCleanBackground ? 'Professional studio backdrop' : 'Keep your original background'}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.toggle, useCleanBackground && { backgroundColor: tintColor }]}
              onPress={() => setUseCleanBackground(!useCleanBackground)}
              activeOpacity={0.7}
            >
              <View style={[styles.toggleThumb, useCleanBackground && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Prompt Editor */}
        <View style={styles.toggleSection}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setShowPromptEditor(!showPromptEditor)}
            activeOpacity={0.7}
          >
            <View style={styles.toggleInfo}>
              <ThemedText style={styles.toggleLabel}>Custom Instructions (Advanced)</ThemedText>
              <ThemedText style={[styles.toggleSubtext, { color: '#999' }]}>
                {showPromptEditor ? 'Tap to hide editor' : 'Tap to customize AI prompt'}
              </ThemedText>
            </View>
            <IconSymbol 
              name={showPromptEditor ? "chevron.up" : "chevron.down"} 
              size={20} 
              color={iconColor} 
            />
          </TouchableOpacity>
          
          {showPromptEditor && (
            <View style={[styles.promptEditorContainer, { backgroundColor }]}>
              <ThemedText style={[styles.promptEditorLabel, { color: '#999', marginBottom: 8 }]}>
                Customize how the AI generates your try-on. Leave empty to use default.
              </ThemedText>
              <TextInput
                style={[styles.promptEditor, { backgroundColor, borderColor: 'rgba(0,0,0,0.1)', color: textColor }]}
                placeholder="Example: Make the outfit look casual and relaxed, keep my natural pose..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                value={customPrompt}
                onChangeText={setCustomPrompt}
                textAlignVertical="top"
              />
              <ThemedText style={[styles.promptEditorHint, { color: '#999', fontSize: 12, marginTop: 8 }]}>
                💡 Tip: Describe the style, pose, or look you want. The AI will preserve your face and body shape.
              </ThemedText>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[
            styles.generateButton, 
            { backgroundColor: tintColor },
            (!userPhoto || isGenerating) && styles.disabledButton
          ]} 
          onPress={handleGenerateTryOn}
          disabled={selectedItems.length === 0 || !userPhoto || isGenerating}
        >
          {isGenerating ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="white" />
              <ThemedText style={styles.generateButtonText}>
                {tryonResult?.status === 'processing' ? 'AI Generating...' : 'Uploading...'}
              </ThemedText>
            </View>
          ) : (
            <>
              <IconSymbol name="plus" size={20} color="white" />
              <ThemedText style={styles.generateButtonText}>
                Generate Virtual Try-On
              </ThemedText>
            </>
          )}
        </TouchableOpacity>

        {/* Engaging loader while AI is generating */}
        {isGenerating && !generatedImage && (
          <View style={styles.loaderSection}>
            <ThemedText style={styles.loaderTitle}>Crafting your look...</ThemedText>
            <View style={[styles.resultCard, { backgroundColor, alignItems: 'center' }]}> 
              <Image
                source={{ uri: 'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif' }}
                style={styles.characterAnimation}
                resizeMode="contain"
                accessibilityLabel="Walking character while we create your try-on"
              />
              <ThemedText style={styles.loaderCaption}>Hang tight — almost there</ThemedText>
            </View>
          </View>
        )}

        {/* Generated Result */}
        {generatedImage && (
          <View style={styles.resultSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Virtual Try-On Result</ThemedText>
            <View style={[styles.resultCard, { backgroundColor }]}>
              <Image source={{ uri: generatedImage }} style={styles.resultImage} />
              <View style={styles.resultActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleSaveResult}>
                  <IconSymbol name="plus" size={16} color={tintColor} />
                  <ThemedText style={styles.actionButtonText}>Save</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleShareResult}>
                  <IconSymbol name="plus" size={16} color={tintColor} />
                  <ThemedText style={styles.actionButtonText}>Share</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>How It Works</ThemedText>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <ThemedText style={styles.instructionNumberText}>1</ThemedText>
            </View>
            <ThemedText style={styles.instructionText}>
              Take a clear photo of yourself in good lighting
            </ThemedText>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <ThemedText style={styles.instructionNumberText}>2</ThemedText>
            </View>
            <ThemedText style={styles.instructionText}>
              Our AI will combine your photo with the product image
            </ThemedText>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <ThemedText style={styles.instructionNumberText}>3</ThemedText>
            </View>
            <ThemedText style={styles.instructionText}>
              See how the item looks on you before buying
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    opacity: 0.7,
  },
  productSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  productCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoSection: {
    marginBottom: 24,
  },
  photoButton: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoPlaceholder: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  photoPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  photoPlaceholderSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  photoContainer: {
    position: 'relative',
  },
  userPhoto: {
    width: screenWidth - 80,
    height: 300,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleSection: {
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  toggleSubtext: {
    fontSize: 13,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  promptEditorContainer: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  promptEditorLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  promptEditor: {
    minHeight: 120,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  promptEditorHint: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    borderTopColor: 'transparent',
    marginRight: 8,
    // Note: In a real app, you'd use Animated.loop for rotation
  },
  resultSection: {
    marginBottom: 24,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
    marginBottom: 16,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  loaderSection: {
    marginBottom: 24,
  },
  loaderTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.8,
  },
  loaderImagePlaceholder: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginBottom: 12,
  },
  characterAnimation: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: 8,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  progressBar: {
    width: 80,
    height: '100%',
    borderRadius: 4,
  },
  loaderCaption: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  instructionsSection: {
    marginBottom: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  colorsContainer: {
    marginTop: 8,
  },
  colorsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.7,
  },
  colorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  colorChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  colorText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  existingPhotoContainer: {
    marginBottom: 16,
  },
  photoCard: {
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  existingPhoto: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  existingPhotoInfo: {
    paddingHorizontal: 4,
  },
  existingPhotoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  existingPhotoSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  photoActionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Multi-item styles
  productCardHeader: {
    position: 'relative',
  },
  removeItemButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
    zIndex: 1,
  },
  // Suggestions styles
  suggestionsSection: {
    marginBottom: 24,
  },
  suggestionsSubtitle: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  suggestionsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  suggestionCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionInfo: {
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  suggestionScore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  suggestionScoreText: {
    fontSize: 11,
    fontWeight: '600',
  },
  suggestionReason: {
    fontSize: 10,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
    marginTop: 'auto',
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
