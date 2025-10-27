import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useUser, useCompleteProfile } from '@/hooks/useAuthQuery';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

interface ProfileData {
  profileImage?: string;
  fullBodyImage?: string;
  gender: 'male' | 'female';
  height: string;
  weight: string;
  // Gender-specific clothing sizes
  shoeSize: string;
  topSize: string;  // Used for both male (shirt) and female (top)
  dressSize?: string;  // Female only
  pantsSize?: string;  // Both genders, different formats
  jacketSize?: string;  // Male only
}

/**
 * Profile Completion Screen
 * Collects user body measurements and personal details after signup
 */
export default function ProfileCompletionScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');

  // Fetch current user from API
  const { data: user, isLoading: isLoadingUser, error: userError } = useUser();
  const { mutate: completeProfile, isPending: isSaving } = useCompleteProfile();

  console.log('🔍 Profile Completion Debug - useUser result:', { user, isLoadingUser, userError });

  const [formData, setFormData] = useState<ProfileData>({
    gender: 'female',
    height: '',
    weight: '',
    shoeSize: '',
    topSize: '',
    dressSize: undefined,
    pantsSize: undefined,
    jacketSize: undefined,
  });

  // Load existing user data when available
  useEffect(() => {
    console.log('🔍 Profile Completion Debug - useEffect triggered, user:', user);
    
    if (user) {
      console.log('🔍 Profile Completion Debug - Setting form data from user:', {
        profileImage: user.profile_picture_url,
        fullBodyImage: user.full_body_image_url,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        clothing_sizes: user.clothing_sizes,
      });
      
      // Extract clothing sizes from the new JSON format
      const clothingSizes = user.clothing_sizes || {};
      
      const newFormData = {
        profileImage: user.profile_picture_url || undefined,
        fullBodyImage: user.full_body_image_url || undefined,
        gender: (user.gender || 'female') as 'male' | 'female',
        height: user.height?.toString() || '',
        weight: user.weight?.toString() || '',
        shoeSize: clothingSizes.shoe || '',
        topSize: clothingSizes.shirt || clothingSizes.top || '', // shirt for male, top for female
        dressSize: clothingSizes.dress || '',
        pantsSize: clothingSizes.pants || '',
        jacketSize: clothingSizes.jacket || '',
      };
      
      setFormData(newFormData);
      
      console.log('🔍 Profile Completion Debug - Form data set:', newFormData);
    }
  }, [user]);

  const handleBackPress = () => {
    router.replace('/(tabs)');
  };

  const handleImageUpload = async (isProfilePhoto: boolean = true) => {
    const photoType = isProfilePhoto ? 'Profile Photo' : 'Full Body Photo';
    
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photos to upload images.'
      );
      return;
    }

    Alert.alert(
      `Add ${photoType}`,
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take Photo',
          onPress: async () => {
            // Check camera permissions
            const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraStatus.status !== 'granted') {
              Alert.alert('Permission Required', 'Camera access is required to take photos.');
              return;
            }

            // Launch camera with optimized quality
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: isProfilePhoto, // Only enable editing for profile photos (square)
              aspect: isProfilePhoto ? [1, 1] : undefined, // No aspect restriction for full body
              quality: 0.5, // Reduced from 0.8 for faster uploads
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              const imageUri = result.assets[0].uri;
              setFormData({
                ...formData,
                [isProfilePhoto ? 'profileImage' : 'fullBodyImage']: imageUri,
              });
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            // Launch image picker with optimized quality
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: isProfilePhoto, // Only enable editing for profile photos (square)
              aspect: isProfilePhoto ? [1, 1] : undefined, // No aspect restriction for full body
              quality: 0.5, // Reduced from 0.8 for faster uploads
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              const imageUri = result.assets[0].uri;
              setFormData({
                ...formData,
                [isProfilePhoto ? 'profileImage' : 'fullBodyImage']: imageUri,
              });
            }
          },
        },
      ]
    );
  };

  const handleSelectGender = (gender: 'male' | 'female') => {
    setFormData({ ...formData, gender });
  };

  const handleSave = async () => {
    console.log('📤 Frontend - Starting profile save...');
    const saveStartTime = Date.now();
    
    // Gender is required for better recommendations
    if (!formData.gender || (formData.gender !== 'male' && formData.gender !== 'female')) {
      Alert.alert('Required', 'Please select your gender to continue');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }

    console.log('📤 Frontend - Starting image conversion...');
    // Convert local images to base64 if they're local file URIs
    let profileImageUrl = formData.profileImage;
    let fullBodyImageUrl = formData.fullBodyImage;

    if (formData.profileImage?.startsWith('file://')) {
      console.log('📤 Frontend - Converting profile image...');
      const convertStart = Date.now();
      profileImageUrl = await convertImageToBase64(formData.profileImage);
      console.log(`⏱️ Frontend - Profile image conversion took: ${Date.now() - convertStart}ms`);
    }

    if (formData.fullBodyImage?.startsWith('file://')) {
      console.log('📤 Frontend - Converting full body image...');
      const convertStart = Date.now();
      fullBodyImageUrl = await convertImageToBase64(formData.fullBodyImage);
      console.log(`⏱️ Frontend - Full body image conversion took: ${Date.now() - convertStart}ms`);
    }

    console.log('📤 Frontend - Preparing API request...');
    const prepStart = Date.now();

    // Prepare clothing sizes based on gender
    const clothing_sizes: Record<string, string> = {};
    
    // Common sizes for both genders
    if (formData.shoeSize) clothing_sizes.shoe = formData.shoeSize;
    if (formData.pantsSize) clothing_sizes.pants = formData.pantsSize;
    
    // Gender-specific sizes
    if (formData.gender === 'male') {
      if (formData.topSize) clothing_sizes.shirt = formData.topSize;
      if (formData.jacketSize) clothing_sizes.jacket = formData.jacketSize;
    } else if (formData.gender === 'female') {
      if (formData.topSize) clothing_sizes.top = formData.topSize;
      if (formData.dressSize) clothing_sizes.dress = formData.dressSize;
    }
    
    // Prepare profile data for API
    const profileData = {
      gender: formData.gender,
      height: formData.height ? parseFloat(formData.height) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      clothing_sizes: Object.keys(clothing_sizes).length > 0 ? clothing_sizes : undefined,
      profile_picture_url: profileImageUrl || undefined,
      full_body_image_url: fullBodyImageUrl || undefined,
    };

    const dataSize = JSON.stringify(profileData).length;
    console.log(`⏱️ Frontend - Data prep took: ${Date.now() - prepStart}ms`);
    console.log(`📤 Frontend - Sending to API (${dataSize} bytes)...`);

    const apiStartTime = Date.now();
    // Call API to save/update profile
    completeProfile(
      { userId: user.id, profileData },
      {
        onSuccess: () => {
          const totalTime = Date.now() - saveStartTime;
          console.log(`✅ Frontend - Profile saved successfully! Total time: ${totalTime}ms`);
          Alert.alert(
            'Profile Saved!',
            'You can always update your profile later from settings for better recommendations.',
            [
              {
                text: 'Continue',
                onPress: () => {
                  router.replace('/(tabs)');
                },
              },
            ]
          );
        },
        onError: (error) => {
          console.error(`❌ Frontend - API error:`, error);
          Alert.alert('Error', error.message || 'Failed to save profile. Please try again.');
        },
      }
    );
  };

  const convertImageToBase64 = async (imageUri: string): Promise<string> => {
    console.log('🔄 Frontend - Starting image conversion:', imageUri.substring(0, 50));
    const startTime = Date.now();
    
    try {
      // If it's already a data URL or external URL, return as is
      if (imageUri.startsWith('data:') || imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        console.log('🔄 Frontend - Image is already base64 or external URL, skipping conversion');
        return imageUri;
      }

      // Use ImageManipulator to convert to base64 (handles local files properly)
      console.log('🔄 Frontend - Converting with ImageManipulator...');
      const readStart = Date.now();
      
      const { base64, uri: newUri } = await ImageManipulator.manipulateAsync(
        imageUri,
        [], // No manipulations needed, just conversion
        { compress: 0.5, base64: true }
      );
      
      console.log(`⏱️ Frontend - Conversion took: ${Date.now() - readStart}ms`);
      
      if (!base64) {
        throw new Error('Failed to get base64 from ImageManipulator');
      }
      
      // Determine content type based on file extension
      const extension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const contentType = extension === 'png' ? 'image/png' : 'image/jpeg';
      
      const dataUri = `data:${contentType};base64,${base64}`;
      const totalTime = Date.now() - startTime;
      console.log(`✅ Frontend - Conversion complete! Total time: ${totalTime}ms, Base64 length: ${dataUri.length}`);
      
      return dataUri;
    } catch (error) {
      console.error('❌ Frontend - Error converting image to base64:', error);
      // Fallback: try fetch as last resort
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (fallbackError) {
        console.error('❌ Frontend - Fallback also failed:', fallbackError);
        return imageUri; // Return original as last resort
      }
    }
  };

  // Show loading state while fetching user data
  if (isLoadingUser) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={[styles.loadingText, { color: iconColor }]}>
            Loading profile...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.skipButton}>
          <ThemedText style={[styles.skipText, { color: iconColor }]}>Skip</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>Set Up Your Profile</ThemedText>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.description, { color: iconColor }]}>
          Help us personalize your experience. Add details later from your profile settings for better recommendations.
        </ThemedText>

        {/* Profile Image */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Profile Photo</ThemedText>
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={() => handleImageUpload(true)}
          >
            {formData.profileImage ? (
              <Image source={{ uri: formData.profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <IconSymbol name="camera.fill" size={40} color={iconColor} />
                <ThemedText style={[styles.placeholderText, { color: iconColor }]}>
                  Tap to add photo
                </ThemedText>
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: tintColor }]}>
              <IconSymbol name="pencil" size={16} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Full Body Photo for Try-On */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Full Body Photo (For Virtual Try-On)</ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
            Add a full-body photo to visualize outfits on yourself
          </ThemedText>
          <TouchableOpacity 
            style={styles.fullBodyImageContainer}
            onPress={() => handleImageUpload(false)}
          >
            {formData.fullBodyImage ? (
              <Image source={{ uri: formData.fullBodyImage }} style={styles.fullBodyImage} />
            ) : (
              <View style={styles.fullBodyImagePlaceholder}>
                <IconSymbol name="camera.fill" size={40} color={iconColor} />
                <ThemedText style={[styles.placeholderText, { color: iconColor }]}>
                  Tap to add full-body photo
                </ThemedText>
                <ThemedText style={[styles.placeholderHint, { color: iconColor }]}>
                  Stand straight, full view
                </ThemedText>
              </View>
            )}
            {formData.fullBodyImage && (
              <View style={[styles.editBadge, { backgroundColor: tintColor }]}>
                <IconSymbol name="pencil" size={16} color="white" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Gender Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Gender *</ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
            This helps us provide better size recommendations
          </ThemedText>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                { 
                  backgroundColor: formData.gender === 'male' ? tintColor : 'transparent',
                  borderColor: formData.gender === 'male' ? tintColor : iconColor
                }
              ]}
              onPress={() => handleSelectGender('male')}
            >
              <ThemedText style={[
                styles.genderText,
                { color: formData.gender === 'male' ? 'white' : iconColor }
              ]}>
                Male
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderButton,
                { 
                  backgroundColor: formData.gender === 'female' ? tintColor : 'transparent',
                  borderColor: formData.gender === 'female' ? tintColor : iconColor
                }
              ]}
              onPress={() => handleSelectGender('female')}
            >
              <ThemedText style={[
                styles.genderText,
                { color: formData.gender === 'female' ? 'white' : iconColor }
              ]}>
                Female
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Body Measurements */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Body Measurements</ThemedText>
          
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Height (cm)</ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: iconColor }]}
                placeholder="e.g., 165"
                placeholderTextColor={iconColor}
                value={formData.height}
                onChangeText={(text) => setFormData({ ...formData, height: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Weight (kg)</ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: iconColor }]}
                placeholder="e.g., 60"
                placeholderTextColor={iconColor}
                value={formData.weight}
                onChangeText={(text) => setFormData({ ...formData, weight: text })}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Clothing Sizes */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Clothing Sizes</ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: iconColor }]}>
            Help us recommend clothes that fit you perfectly
          </ThemedText>
          
          {/* Common: Shoe Size */}
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Shoe Size</ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: iconColor }]}
                placeholder={formData.gender === 'male' ? "e.g., 10" : "e.g., 7"}
                placeholderTextColor={iconColor}
                value={formData.shoeSize}
                onChangeText={(text) => setFormData({ ...formData, shoeSize: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Gender-specific: Male Sizes */}
          {formData.gender === 'male' && (
            <>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Shirt Size</ThemedText>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor: iconColor }]}
                    placeholder="e.g., M"
                    placeholderTextColor={iconColor}
                    value={formData.topSize}
                    onChangeText={(text) => setFormData({ ...formData, topSize: text })}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Jacket/Blazer Size</ThemedText>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor: iconColor }]}
                    placeholder="e.g., 40"
                    placeholderTextColor={iconColor}
                    value={formData.jacketSize || ''}
                    onChangeText={(text) => setFormData({ ...formData, jacketSize: text })}
                  />
                </View>
              </View>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Pants Size (Waist × Inseam)</ThemedText>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor: iconColor }]}
                    placeholder="e.g., 32x30"
                    placeholderTextColor={iconColor}
                    value={formData.pantsSize || ''}
                    onChangeText={(text) => setFormData({ ...formData, pantsSize: text })}
                  />
                </View>
              </View>
            </>
          )}

          {/* Gender-specific: Female Sizes */}
          {formData.gender === 'female' && (
            <>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Top/Blouse Size</ThemedText>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor: iconColor }]}
                    placeholder="e.g., M"
                    placeholderTextColor={iconColor}
                    value={formData.topSize}
                    onChangeText={(text) => setFormData({ ...formData, topSize: text })}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Dress Size</ThemedText>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor: iconColor }]}
                    placeholder="e.g., 8"
                    placeholderTextColor={iconColor}
                    value={formData.dressSize || ''}
                    onChangeText={(text) => setFormData({ ...formData, dressSize: text })}
                  />
                </View>
              </View>
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Pants/Jeans Size</ThemedText>
                  <TextInput
                    style={[styles.input, { color: textColor, borderColor: iconColor }]}
                    placeholder="e.g., 28 or 28x30"
                    placeholderTextColor={iconColor}
                    value={formData.pantsSize || ''}
                    onChangeText={(text) => setFormData({ ...formData, pantsSize: text })}
                  />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            { backgroundColor: tintColor },
            isSaving && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
          )}
          <ThemedText style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Complete Profile'}
          </ThemedText>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skipText: {
    fontSize: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
    opacity: 0.7,
  },
  fullBodyImageContainer: {
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  fullBodyImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  fullBodyImagePlaceholder: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  placeholderHint: {
    marginTop: 4,
    fontSize: 11,
    opacity: 0.6,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 24,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

