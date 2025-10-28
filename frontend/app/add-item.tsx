import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Image, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomHeader } from '@/components/home/CustomHeader';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useCreateWardrobeItem, useUpdateWardrobeItem, useWardrobeItem } from '@/hooks/useWardrobe';
import { useUser } from '@/hooks/useAuthQuery';
import { useLocalSearchParams } from 'expo-router';

interface WardrobeItemForm {
  title: string;
  category: string;
  colors: string[];
  tags: string[];
  imageUrl: string | null;
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
    
    const { base64, uri: newUri } = await ImageManipulator.manipulateAsync(
      imageUri,
      [], // No manipulations needed, just conversion
      { compress: 0.5, base64: true }
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
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              setFormData({ ...formData, imageUrl: result.assets[0].uri });
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
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              setFormData({ ...formData, imageUrl: result.assets[0].uri });
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
      // Map category to match backend schema
      const categoryMap: Record<string, string> = {
        'top': 'top',
        'bottom': 'bottom',
        'outerwear': 'outerwear',
        'dress': 'dress',
        'shoe': 'shoes', // Backend expects 'shoes' not 'shoe'
        'accessory': 'accessories', // Backend expects 'accessories'
        'underwear': 'underwear',
      };

      const backendCategory = categoryMap[selectedCategory] || selectedCategory;

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

      // Determine if we should send image_original (only if it's new/changed)
      // If imageData is a data URL, send it; if it's an S3 URL, send it; otherwise don't send
      const shouldUpdateImage = imageData && (
        imageData.startsWith('data:') || // New base64 image
        (imageData && !formData.imageUrl?.includes(imageData)) // Changed image
      );
      
      const itemData: any = {
        title: formData.title,
        category: backendCategory,
        colors: selectedColors,
        tags: selectedTags,
      };
      
      // Only send image if it's been changed or is new
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
        // Create new item
        await createMutation.mutateAsync({
          userId: user.id,
          item: {
            ...itemData,
            image_original: imageData, // Always send for new items
          },
        });
        
        Alert.alert(
          'Item Added!',
          'Your wardrobe item has been added successfully.',
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
  if (isEditMode && isLoadingItem) {
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
          
          {formData.imageUrl && (
            <TouchableOpacity
              style={[styles.removeButton, { backgroundColor: tintColor }]}
              onPress={() => setFormData({ ...formData, imageUrl: null })}
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
          
          <View style={[styles.inputContainer, { borderColor }]}>
            <TextInput
              style={[styles.textInput, { color: textColor }]}
              placeholder="e.g., White Cotton T-Shirt"
              placeholderTextColor={borderColor}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
            />
          </View>
        </View>

        {/* Category Selection */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Category *
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
          
          <View style={styles.colorGrid}>
            {commonColors.map(renderColorButton)}
          </View>
        </View>

        {/* Tags Section */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Tags
          </ThemedText>
          
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

