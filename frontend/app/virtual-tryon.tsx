import { StyleSheet, View, TouchableOpacity, Image, Alert, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useAuthQuery';
import { useGenerateVirtualTryOn, useVirtualTryOnResult, convertImageToBase64 } from '@/hooks/useVirtualTryOn';
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
  const { itemId, itemType, itemData } = useLocalSearchParams<{ itemId: string; itemType?: string; itemData?: string }>();
  
  // Get current user to check for existing full body photo
  const { data: user } = useUser();
  
  const [selectedItem, setSelectedItem] = useState<BoutiqueItem | WardrobeItemTryOn | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [hasUsedExistingPhoto, setHasUsedExistingPhoto] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [tryonId, setTryonId] = useState<number | null>(null);
  const [useCleanBackground, setUseCleanBackground] = useState(false); // Toggle for clean background
  
  // API hooks
  const generateMutation = useGenerateVirtualTryOn();
  const { data: tryonResult } = useVirtualTryOnResult(
    tryonId,
    user?.id ?? 0,
    tryonId !== null
  );

  // Find the selected item
  useEffect(() => {
    if (itemType === 'wardrobe' && itemData) {
      // Parse wardrobe item data
      try {
        const parsedData = JSON.parse(itemData);
        setSelectedItem(parsedData);
      } catch (error) {
        console.error('Error parsing wardrobe item data:', error);
      }
    } else if (itemId) {
      // Find boutique item from mock data
      const item = mockBoutiqueData.find(item => item.id === itemId);
      setSelectedItem(item || null);
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
    
    console.log('📊 Try-on status:', tryonResult.status);
    
    if (tryonResult.status === 'completed' && tryonResult.result_image_url) {
      setGeneratedImage(tryonResult.result_image_url);
      setIsGenerating(false);
      Alert.alert('Success!', 'Virtual try-on generated successfully!');
    } else if (tryonResult.status === 'failed') {
      setIsGenerating(false);
      Alert.alert(
        'Generation Failed',
        tryonResult.error_message || 'Failed to generate virtual try-on. Please try again.'
      );
    } else if (tryonResult.status === 'processing') {
      // Still processing, keep showing loading state
      setIsGenerating(true);
    }
  }, [tryonResult]);

  const handleBackPress = () => {
    router.back();
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
                  [{ resize: { width: 800 } }],
                  { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
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
                  [{ resize: { width: 800 } }],
                  { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
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

  const handleGenerateTryOn = async () => {
    if (!selectedItem || !userPhoto || !user?.id) {
      Alert.alert('Missing Information', 'Please select both an item and your photo to generate virtual try-on');
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('🎨 Generating virtual try-on with Gemini API...');
      console.log('📦 Selected item:', selectedItem.title);
      console.log('🏷️ Item type:', itemType || 'boutique');
      console.log('📸 User photo URL:', userPhoto);
      
      // Prepare request (no base64 conversion needed!)
      const request = {
        user_image_url: userPhoto, // Already an S3 URL!
        item_image_url: selectedItem.imageUrl,
        item_details: {
          category: selectedItem.category,
          colors: selectedItem.colors || [],
          type: (itemType || 'boutique') as 'wardrobe' | 'boutique',
        },
        use_clean_background: useCleanBackground, // User preference
      };
      
      console.log('🚀 Sending request to backend...');
      
      // Call API to generate try-on
      const result = await generateMutation.mutateAsync({
        userId: user.id,
        request,
      });
      
      console.log('✅ Try-on request created with ID:', result.id);
      console.log('📊 Status:', result.status);
      
      // Start polling for result
      setTryonId(result.id);
      
      // The useEffect will handle the polling and status updates
      
    } catch (error: any) {
      console.error('❌ Error generating virtual try-on:', error);
      setIsGenerating(false);
      
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to generate virtual try-on. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleSaveResult = () => {
    Alert.alert('Save Result', 'Virtual try-on result saved to your gallery!');
  };

  const handleShareResult = () => {
    Alert.alert('Share Result', 'Share your virtual try-on result with friends!');
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
        {/* Product Information */}
        <View style={styles.productSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{itemType === 'wardrobe' ? 'Your Item' : 'Product'}</ThemedText>
          <View style={[styles.productCard, { backgroundColor }]}>
            <Image source={{ uri: selectedItem.imageUrl }} style={styles.productImage} />
            <View style={styles.productInfo}>
              {'brand' in selectedItem && <ThemedText style={styles.brandName}>{selectedItem.brand}</ThemedText>}
              <ThemedText style={styles.productTitle}>{selectedItem.title}</ThemedText>
              {'price' in selectedItem && <ThemedText style={styles.price}>₦{selectedItem.price.toLocaleString()}</ThemedText>}
              {'colors' in selectedItem && selectedItem.colors && (
                <View style={styles.colorsContainer}>
                  <ThemedText style={styles.colorsLabel}>Colors:</ThemedText>
                  <View style={styles.colorsList}>
                    {selectedItem.colors.map((color: string) => (
                      <View key={color} style={[styles.colorChip, { backgroundColor: tintColor }]}>
                        <ThemedText style={styles.colorText}>{color}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

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

        <TouchableOpacity 
          style={[
            styles.generateButton, 
            { backgroundColor: tintColor },
            (!userPhoto || isGenerating) && styles.disabledButton
          ]} 
          onPress={handleGenerateTryOn}
          disabled={!userPhoto || isGenerating}
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
});
