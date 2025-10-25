import { useState, type FC } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';

// Type definitions
interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  is_active: boolean;
}

interface ColorScheme {
  background: string;
  text: string;
  tint: string;
  tabIconDefault: string;
}

interface Preferences {
  backgroundPreference: 'clean' | 'original';
  favoriteStyles: string[];
  preferredColors: string[];
  notifications: boolean;
  darkMode: boolean;
}

/**
 * Profile Section Component
 * Displays user avatar, name, and basic information
 */
const ProfileSection: FC<{ user: User | null; colors: ColorScheme }> = ({ user, colors }) => (
  <View style={[styles.section, { backgroundColor: colors.background }]}>
    <View style={styles.profileHeader}>
      <View style={[styles.avatarContainer, { backgroundColor: colors.tint }]}>
        {user?.profile_picture_url ? (
          <Image
            source={{ uri: user.profile_picture_url }}
            style={styles.avatar}
          />
        ) : (
          <IconSymbol name="person.fill" size={40} color="white" />
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>
          {user?.first_name && user?.last_name 
            ? `${user.first_name} ${user.last_name}`
            : user?.username || 'User'
          }
        </Text>
        <Text style={[styles.userEmail, { color: colors.tabIconDefault }]}>
          {user?.email}
        </Text>
      </View>
    </View>
  </View>
);

/**
 * Wardrobe Statistics Section
 * Shows user's wardrobe metrics and management options
 */
const WardrobeSection: FC<{ colors: ColorScheme }> = ({ colors }) => (
  <View style={[styles.section, { backgroundColor: colors.background }]}>
    <Text style={[styles.sectionTitle, { color: colors.text }]}>
      My Wardrobe
    </Text>
    
    <View style={styles.statsGrid}>
      <View style={[styles.statItem, { backgroundColor: colors.background }]}>
        <Text style={[styles.statNumber, { color: colors.tint }]}>24</Text>
        <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>
          Total Items
        </Text>
      </View>
      
      <View style={[styles.statItem, { backgroundColor: colors.background }]}>
        <Text style={[styles.statNumber, { color: colors.tint }]}>8</Text>
        <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>
          Saved Outfits
        </Text>
      </View>
      
      <View style={[styles.statItem, { backgroundColor: colors.background }]}>
        <Text style={[styles.statNumber, { color: colors.tint }]}>12</Text>
        <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>
          Try-Ons
        </Text>
      </View>
      
      <View style={[styles.statItem, { backgroundColor: colors.background }]}>
        <Text style={[styles.statNumber, { color: colors.tint }]}>3</Text>
        <Text style={[styles.statLabel, { color: colors.tabIconDefault }]}>
          Purchases
        </Text>
      </View>
    </View>

    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.tint }]}>
      <IconSymbol name="plus" size={20} color="white" />
      <Text style={styles.actionButtonText}>Add Items</Text>
    </TouchableOpacity>
  </View>
);

/**
 * Preferences Section
 * Manages user's style and app preferences
 */
const PreferencesSection: FC<{ 
  preferences: Preferences; 
  colors: ColorScheme; 
  toggleBackgroundPreference: () => void;
  toggleNotifications: () => void;
}> = ({ preferences, colors, toggleBackgroundPreference, toggleNotifications }) => (
  <View style={[styles.section, { backgroundColor: colors.background }]}>
    <Text style={[styles.sectionTitle, { color: colors.text }]}>
      Preferences
    </Text>

    {/* Background Preference */}
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceInfo}>
        <Text style={[styles.preferenceTitle, { color: colors.text }]}>
          Background Processing
        </Text>
        <Text style={[styles.preferenceDescription, { color: colors.tabIconDefault }]}>
          {preferences.backgroundPreference === 'clean' 
            ? 'Clean background (studio look)' 
            : 'Keep original background'
          }
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.toggleButton, { backgroundColor: colors.tint }]}
        onPress={toggleBackgroundPreference}
      >
        <Text style={styles.toggleButtonText}>
          {preferences.backgroundPreference === 'clean' ? 'Clean' : 'Original'}
        </Text>
      </TouchableOpacity>
    </View>

    {/* Notifications */}
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceInfo}>
        <Text style={[styles.preferenceTitle, { color: colors.text }]}>
          Notifications
        </Text>
        <Text style={[styles.preferenceDescription, { color: colors.tabIconDefault }]}>
          Get notified about new recommendations and features
        </Text>
      </View>
      <Switch
        value={preferences.notifications}
        onValueChange={toggleNotifications}
        trackColor={{ false: colors.tabIconDefault, true: colors.tint }}
        thumbColor="white"
      />
    </View>

    {/* Style Preferences */}
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceInfo}>
        <Text style={[styles.preferenceTitle, { color: colors.text }]}>
          Favorite Styles
        </Text>
        <Text style={[styles.preferenceDescription, { color: colors.tabIconDefault }]}>
          {preferences.favoriteStyles.join(', ')}
        </Text>
      </View>
      <TouchableOpacity style={styles.editButton}>
        <IconSymbol name="pencil" size={20} color={colors.tint} />
      </TouchableOpacity>
    </View>
  </View>
);

/**
 * Settings Section
 * App settings, privacy, and account management
 */
const SettingsSection: FC<{ colors: ColorScheme; handleLogout: () => void }> = ({ colors, handleLogout }) => (
  <View style={[styles.section, { backgroundColor: colors.background }]}>
    <Text style={[styles.sectionTitle, { color: colors.text }]}>
      Settings
    </Text>

    <TouchableOpacity style={styles.settingItem}>
      <IconSymbol name="lock" size={20} color={colors.tint} />
      <Text style={[styles.settingText, { color: colors.text }]}>
        Privacy & Security
      </Text>
      <IconSymbol name="chevron.right" size={16} color={colors.tabIconDefault} />
    </TouchableOpacity>

    <TouchableOpacity style={styles.settingItem}>
      <IconSymbol name="questionmark.circle" size={20} color={colors.tint} />
      <Text style={[styles.settingText, { color: colors.text }]}>
        Help & Support
      </Text>
      <IconSymbol name="chevron.right" size={16} color={colors.tabIconDefault} />
    </TouchableOpacity>

    <TouchableOpacity style={styles.settingItem}>
      <IconSymbol name="info.circle" size={20} color={colors.tint} />
      <Text style={[styles.settingText, { color: colors.text }]}>
        About TryRack
      </Text>
      <IconSymbol name="chevron.right" size={16} color={colors.tabIconDefault} />
    </TouchableOpacity>

    <TouchableOpacity 
      style={[styles.logoutButton, { backgroundColor: '#FF3B30' }]}
      onPress={handleLogout}
    >
      <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color="white" />
      <Text style={styles.logoutText}>Sign Out</Text>
    </TouchableOpacity>
  </View>
);

/**
 * Profile Screen Component
 * Displays user information, preferences, wardrobe stats, and settings
 * 
 * Features:
 * - User profile information display
 * - Style preferences management
 * - Wardrobe statistics
 * - App settings and logout functionality
 * 
 * @see https://docs.expo.dev/versions/latest/sdk/securestore/ - User data from secure storage
 */
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // User preferences state (from blueprint documentation)
  const [preferences, setPreferences] = useState<Preferences>({
    backgroundPreference: 'clean', // 'clean' | 'original'
    favoriteStyles: ['minimal', 'street'],
    preferredColors: ['black', 'white'],
    notifications: true,
    darkMode: colorScheme === 'dark',
  });

  /**
   * Handle logout with confirmation
   * Clears all authentication data and navigates to sign-in page
   */
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
              // Navigate to sign-in page after successful logout
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

  /**
   * Toggle background preference
   * Updates user's preference for image background processing
   */
  const toggleBackgroundPreference = () => {
    setPreferences(prev => ({
      ...prev,
      backgroundPreference: prev.backgroundPreference === 'clean' ? 'original' : 'clean',
    }));
  };

  /**
   * Toggle notifications setting
   * Updates user's notification preferences
   */
  const toggleNotifications = () => {
    setPreferences(prev => ({
      ...prev,
      notifications: !prev.notifications,
    }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProfileSection user={user} colors={colors} />
        <WardrobeSection colors={colors} />
        <PreferencesSection 
          preferences={preferences} 
          colors={colors} 
          toggleBackgroundPreference={toggleBackgroundPreference}
          toggleNotifications={toggleNotifications}
        />
        <SettingsSection colors={colors} handleLogout={handleLogout} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    padding: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});