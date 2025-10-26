import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

interface ProfileData {
  profileImage?: string;
  fullBodyImage?: string;
  gender: 'male' | 'female';
  height: string;
  weight: string;
  shoeSize: string;
  topSize: string;
  dressSize: string;
  pantsSize: string;
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

  const [formData, setFormData] = useState<ProfileData>({
    gender: 'female',
    height: '',
    weight: '',
    shoeSize: '',
    topSize: '',
    dressSize: '',
    pantsSize: '',
  });

  const handleBackPress = () => {
    router.replace('/(tabs)');
  };

  const handleImageUpload = (isProfilePhoto: boolean = true) => {
    const photoType = isProfilePhoto ? 'Profile Photo' : 'Full Body Photo';
    const mockUrls = isProfilePhoto 
      ? [
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop'
        ]
      : [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=600&fit=crop',
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=600&fit=crop'
        ];

    Alert.alert(
      `Add ${photoType}`,
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Take Photo', 
          onPress: () => {
            // TODO: Implement camera functionality
            const mockImageUrl = mockUrls[0];
            if (isProfilePhoto) {
              setFormData({ ...formData, profileImage: mockImageUrl });
            } else {
              setFormData({ ...formData, fullBodyImage: mockImageUrl });
            }
            Alert.alert('Success', `${photoType} added!`);
          }
        },
        { 
          text: 'Choose from Gallery', 
          onPress: () => {
            // TODO: Implement gallery picker
            const mockImageUrl = mockUrls[1];
            if (isProfilePhoto) {
              setFormData({ ...formData, profileImage: mockImageUrl });
            } else {
              setFormData({ ...formData, fullBodyImage: mockImageUrl });
            }
            Alert.alert('Success', `${photoType} added!`);
          }
        }
      ]
    );
  };

  const handleSelectGender = (gender: 'male' | 'female') => {
    setFormData({ ...formData, gender });
  };

  const handleSave = () => {
    // Gender is required for better recommendations
    if (!formData.gender || (formData.gender !== 'male' && formData.gender !== 'female')) {
      Alert.alert('Required', 'Please select your gender to continue');
      return;
    }
    
    // TODO: Call backend API to save profile data
    console.log('Profile data:', formData);
    
    Alert.alert(
      'Profile Saved!',
      'You can always update your profile later from settings for better recommendations.',
      [
        {
          text: 'Continue',
          onPress: () => {
            // Navigate to main app
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };

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
            onPress={handleImageUpload}
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
          
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Shoe Size</ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: iconColor }]}
                placeholder="e.g., 7"
                placeholderTextColor={iconColor}
                value={formData.shoeSize}
                onChangeText={(text) => setFormData({ ...formData, shoeSize: text })}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Top Size</ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: iconColor }]}
                placeholder="e.g., M"
                placeholderTextColor={iconColor}
                value={formData.topSize}
                onChangeText={(text) => setFormData({ ...formData, topSize: text })}
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Dress Size</ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: iconColor }]}
                placeholder="e.g., 8"
                placeholderTextColor={iconColor}
                value={formData.dressSize}
                onChangeText={(text) => setFormData({ ...formData, dressSize: text })}
              />
            </View>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Pants Size</ThemedText>
              <TextInput
                style={[styles.input, { color: textColor, borderColor: iconColor }]}
                placeholder="e.g., 32"
                placeholderTextColor={iconColor}
                value={formData.pantsSize}
                onChangeText={(text) => setFormData({ ...formData, pantsSize: text })}
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: tintColor }]}
          onPress={handleSave}
        >
          <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
          <ThemedText style={styles.saveButtonText}>Complete Profile</ThemedText>
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
});

