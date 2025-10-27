import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useUserType } from '@/contexts/UserTypeContext';
import { router } from 'expo-router';

/**
 * Boutique Profile Screen
 * Allows boutique owners to manage their business profile, company information, and settings
 * Based on blueprint requirements for boutique business management
 */
export default function BoutiqueProfileScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const { signOut } = useAuth();
  const { setUserType } = useUserType();

  // Boutique business information state
  const [boutiqueInfo, setBoutiqueInfo] = React.useState({
    businessName: 'Luxe Boutique',
    businessType: 'Clothing Store',
    email: 'info@luxeboutique.com',
    phone: '+234 801 234 5678',
    address: '123 Fashion Street, Victoria Island, Lagos',
    description: 'A premium boutique offering the latest in fashion and style.',
    categories: ['Dresses', 'Outerwear', 'Accessories'],
    establishedYear: 2020,
    website: 'www.luxeboutique.com',
    socialLinks: {
      instagram: '@luxeboutique',
      facebook: 'Luxe Boutique',
      twitter: '@luxeboutique'
    }
  });

  const handleBackPress = () => {
    router.back();
  };

  const handleSaveChanges = () => {
    Alert.alert('Success', 'Boutique profile updated successfully!');
  };

  const handleSwitchToIndividual = () => {
    console.log('handleSwitchToIndividual called');
    
    // Use setTimeout to ensure Alert is shown after current execution context
    setTimeout(() => {
      Alert.alert(
        'Switch to Individual Mode',
        'Switch to individual mode? You can always switch back in settings.',
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => console.log('Cancelled mode switch')
          },
          { 
            text: 'Switch', 
            onPress: async () => {
              console.log('Switching to individual mode...');
              try {
                await setUserType('individual');
                console.log('User type set, navigating...');
                router.replace('/(tabs)');
              } catch (error) {
                console.error('Error switching mode:', error);
                Alert.alert('Error', 'Failed to switch mode. Please try again.');
              }
            }
          }
        ]
      );
    }, 100);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth/sign-in');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleNavigateToPrivacy = () => {
    router.push('/(boutique)/privacy-security');
  };

  const handleNavigateToHelp = () => {
    router.push('/(boutique)/help-support');
  };

  const handleNavigateToAbout = () => {
    router.push('/(boutique)/about');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Boutique Profile"
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Business Profile Section */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Business Profile
          </ThemedText>
          
          {/* Business Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=120&fit=crop' }} 
              style={styles.logoImage} 
            />
            <TouchableOpacity style={[styles.editButton, { backgroundColor: tintColor }]}>
              <IconSymbol name="pencil" size={16} color="white" />
              <ThemedText style={styles.editButtonText}>Edit Logo</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Business Information */}
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Business Name</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, color: useThemeColor({}, 'text') }]}
              value={boutiqueInfo.businessName}
              onChangeText={(text) => setBoutiqueInfo({ ...boutiqueInfo, businessName: text })}
              placeholder="Business Name"
              placeholderTextColor={iconColor}
            />
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Business Type</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, color: useThemeColor({}, 'text') }]}
              value={boutiqueInfo.businessType}
              onChangeText={(text) => setBoutiqueInfo({ ...boutiqueInfo, businessType: text })}
              placeholder="Business Type"
              placeholderTextColor={iconColor}
            />
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Description</ThemedText>
            <TextInput
              style={[styles.textArea, { backgroundColor, color: useThemeColor({}, 'text') }]}
              value={boutiqueInfo.description}
              onChangeText={(text) => setBoutiqueInfo({ ...boutiqueInfo, description: text })}
              placeholder="Describe your boutique..."
              placeholderTextColor={iconColor}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Contact Information
          </ThemedText>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, color: useThemeColor({}, 'text') }]}
              value={boutiqueInfo.email}
              onChangeText={(text) => setBoutiqueInfo({ ...boutiqueInfo, email: text })}
              placeholder="Email"
              placeholderTextColor={iconColor}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Phone</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, color: useThemeColor({}, 'text') }]}
              value={boutiqueInfo.phone}
              onChangeText={(text) => setBoutiqueInfo({ ...boutiqueInfo, phone: text })}
              placeholder="Phone"
              placeholderTextColor={iconColor}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Address</ThemedText>
            <TextInput
              style={[styles.textArea, { backgroundColor, color: useThemeColor({}, 'text') }]}
              value={boutiqueInfo.address}
              onChangeText={(text) => setBoutiqueInfo({ ...boutiqueInfo, address: text })}
              placeholder="Business Address"
              placeholderTextColor={iconColor}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Website</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, color: useThemeColor({}, 'text') }]}
              value={boutiqueInfo.website}
              onChangeText={(text) => setBoutiqueInfo({ ...boutiqueInfo, website: text })}
              placeholder="Website"
              placeholderTextColor={iconColor}
              keyboardType="url"
            />
          </View>
        </View>

        {/* Social Media Links */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Social Media
          </ThemedText>

          <View style={styles.infoRow}>
            <IconSymbol name="camera.fill" size={20} color={tintColor} />
            <ThemedText style={styles.label}>Instagram</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, color: useThemeColor({}, 'text'), flex: 1 }]}
              value={boutiqueInfo.socialLinks.instagram}
              onChangeText={(text) => setBoutiqueInfo({ 
                ...boutiqueInfo, 
                socialLinks: { ...boutiqueInfo.socialLinks, instagram: text }
              })}
              placeholder="@username"
              placeholderTextColor={iconColor}
            />
          </View>

          <View style={styles.infoRow}>
            <IconSymbol name="info.circle" size={20} color={tintColor} />
            <ThemedText style={styles.label}>Facebook</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, color: useThemeColor({}, 'text'), flex: 1 }]}
              value={boutiqueInfo.socialLinks.facebook}
              onChangeText={(text) => setBoutiqueInfo({ 
                ...boutiqueInfo, 
                socialLinks: { ...boutiqueInfo.socialLinks, facebook: text }
              })}
              placeholder="Page Name"
              placeholderTextColor={iconColor}
            />
          </View>

          <View style={styles.infoRow}>
            <IconSymbol name="pencil" size={20} color={tintColor} />
            <ThemedText style={styles.label}>Twitter/X</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, color: useThemeColor({}, 'text'), flex: 1 }]}
              value={boutiqueInfo.socialLinks.twitter}
              onChangeText={(text) => setBoutiqueInfo({ 
                ...boutiqueInfo, 
                socialLinks: { ...boutiqueInfo.socialLinks, twitter: text }
              })}
              placeholder="@username"
              placeholderTextColor={iconColor}
            />
          </View>
        </View>

        {/* Business Stats */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Business Statistics
          </ThemedText>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: `${tintColor}20` }]}>
              <IconSymbol name="calendar" size={24} color={tintColor} />
              <ThemedText style={styles.statValue}>Est. {boutiqueInfo.establishedYear}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: iconColor }]}>Established</ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: `${tintColor}20` }]}>
              <IconSymbol name="bag.fill" size={24} color={tintColor} />
              <ThemedText style={styles.statValue}>45</ThemedText>
              <ThemedText style={[styles.statLabel, { color: iconColor }]}>Products</ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: `${tintColor}20` }]}>
              <IconSymbol name="person.fill" size={24} color={tintColor} />
              <ThemedText style={styles.statValue}>128</ThemedText>
              <ThemedText style={[styles.statLabel, { color: iconColor }]}>Customers</ThemedText>
            </View>

            <View style={[styles.statCard, { backgroundColor: `${tintColor}20` }]}>
              <IconSymbol name="star.fill" size={24} color={tintColor} />
              <ThemedText style={styles.statValue}>4.8</ThemedText>
              <ThemedText style={[styles.statLabel, { color: iconColor }]}>Rating</ThemedText>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Account Settings
          </ThemedText>

          <TouchableOpacity style={styles.settingItem} onPress={handleSwitchToIndividual}>
            <IconSymbol name="person.fill" size={20} color={tintColor} />
            <ThemedText style={[styles.settingText, { color: useThemeColor({}, 'text') }]}>
              Switch to Individual Mode
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleNavigateToPrivacy}>
            <IconSymbol name="lock" size={20} color={tintColor} />
            <ThemedText style={[styles.settingText, { color: useThemeColor({}, 'text') }]}>
              Privacy & Security
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleNavigateToHelp}>
            <IconSymbol name="questionmark.circle" size={20} color={tintColor} />
            <ThemedText style={[styles.settingText, { color: useThemeColor({}, 'text') }]}>
              Help & Support
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem} onPress={handleNavigateToAbout}>
            <IconSymbol name="info.circle" size={20} color={tintColor} />
            <ThemedText style={[styles.settingText, { color: useThemeColor({}, 'text') }]}>
              About
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color={iconColor} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: tintColor }]}
            onPress={handleSaveChanges}
          >
            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.logoutButton, { borderColor: tintColor }]}
            onPress={handleLogout}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={18} color="#FF3B30" />
            <ThemedText style={[styles.logoutText, { color: '#FF3B30' }]}>Sign Out</ThemedText>
          </TouchableOpacity>
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
    marginTop: 20,
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 32,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
