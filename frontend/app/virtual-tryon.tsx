import { StyleSheet, View, TouchableOpacity, Image, Alert, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';

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
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  
  const [selectedItem, setSelectedItem] = useState<BoutiqueItem | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  // Find the selected item
  useEffect(() => {
    if (itemId) {
      const item = mockBoutiqueData.find(item => item.id === itemId);
      setSelectedItem(item || null);
    }
  }, [itemId]);

  const handleBackPress = () => {
    router.back();
  };

  const handleSelectPhoto = () => {
    Alert.alert(
      'Select Photo',
      'Choose how you\'d like to add your photo for virtual try-on',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Take Photo', 
          onPress: () => {
            // Mock camera functionality - simulate taking a photo
            console.log('Opening camera...');
            setTimeout(() => {
              setUserPhoto('https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop');
              Alert.alert('Photo Taken', 'Photo captured successfully!');
            }, 1000);
          }
        },
        { 
          text: 'Choose from Gallery', 
          onPress: () => {
            // Mock gallery functionality - simulate selecting a photo
            console.log('Opening gallery...');
            setTimeout(() => {
              setUserPhoto('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop');
              Alert.alert('Photo Selected', 'Photo selected from gallery!');
            }, 1000);
          }
        }
      ]
    );
  };

  const handleGenerateTryOn = async () => {
    if (!selectedItem || !userPhoto) {
      Alert.alert('Missing Information', 'Please select both an item and your photo to generate virtual try-on');
      return;
    }

    setIsGenerating(true);
    
    try {
      // TODO: Implement Gemini API integration
      // This will use Gemini's image generation to combine user photo with product
      console.log('Generating virtual try-on with Gemini API...');
      console.log('Selected item:', selectedItem.title);
      console.log('User photo:', userPhoto);
      
      // Simulate API call with progress updates
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock generated image (replace with actual Gemini API result)
      // Using a realistic virtual try-on result image
      setGeneratedImage('https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=600&fit=crop');
      
      Alert.alert('Success!', 'Virtual try-on generated successfully!');
      
    } catch (error) {
      console.error('Error generating virtual try-on:', error);
      Alert.alert('Error', 'Failed to generate virtual try-on. Please try again.');
    } finally {
      setIsGenerating(false);
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
          <ThemedText type="subtitle" style={styles.sectionTitle}>Product</ThemedText>
          <View style={[styles.productCard, { backgroundColor }]}>
            <Image source={{ uri: selectedItem.imageUrl }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <ThemedText style={styles.brandName}>{selectedItem.brand}</ThemedText>
              <ThemedText style={styles.productTitle}>{selectedItem.title}</ThemedText>
              <ThemedText style={styles.price}>₦{selectedItem.price.toLocaleString()}</ThemedText>
            </View>
          </View>
        </View>

        {/* User Photo Section */}
        <View style={styles.photoSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Your Photo</ThemedText>
          <TouchableOpacity style={[styles.photoButton, { backgroundColor }]} onPress={handleSelectPhoto}>
            {userPhoto ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: userPhoto }} style={styles.userPhoto} />
                <TouchableOpacity 
                  style={styles.removePhotoButton} 
                  onPress={() => setUserPhoto(null)}
                >
                  <IconSymbol name="plus" size={16} color="white" style={{ transform: [{ rotate: '45deg' }] }} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <IconSymbol name="plus" size={32} color={iconColor} />
                <ThemedText style={styles.photoPlaceholderText}>Add Your Photo</ThemedText>
                <ThemedText style={styles.photoPlaceholderSubtext}>
                  Take a photo or choose from gallery
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Generate Button */}
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
              <View style={styles.loadingSpinner} />
              <ThemedText style={styles.generateButtonText}>
                Generating Virtual Try-On...
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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
});
