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
import { useUserType } from '@/contexts/UserTypeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';

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

interface StyleInsight {
  id: string;
  title: string;
  description: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  icon: 'arrow.up' | 'paintpalette' | 'leaf';
}

interface OutfitHistory {
  id: string;
  date: string;
  items: string[];
  imageUrl: string;
  occasion: string;
  rating: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'star.fill' | 'leaf.fill' | 'crown.fill' | 'camera.fill';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface FashionStats {
  totalOutfits: number;
  favoriteColor: string;
  mostWornItem: string;
  styleScore: number;
  sustainabilityScore: number;
  itemsAddedThisMonth: number;
}

// Mock data for enhanced profile features
const mockStyleInsights: StyleInsight[] = [
  {
    id: '1',
    title: 'Style Evolution',
    description: 'Your style has evolved 23% this month',
    value: '+23%',
    trend: 'up',
    icon: 'arrow.up'
  },
  {
    id: '2',
    title: 'Color Palette',
    description: 'Black is your most worn color',
    value: '42%',
    trend: 'stable',
    icon: 'paintpalette'
  },
  {
    id: '3',
    title: 'Sustainability',
    description: 'You\'re 15% more sustainable than last month',
    value: '85%',
    trend: 'up',
    icon: 'leaf'
  }
];

const mockOutfitHistory: OutfitHistory[] = [
  {
    id: '1',
    date: '2024-01-15',
    items: ['Black Blazer', 'White Shirt', 'Dark Jeans'],
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=200&h=200&fit=crop',
    occasion: 'Work Meeting',
    rating: 4.5
  },
  {
    id: '2',
    date: '2024-01-14',
    items: ['Navy Dress', 'Black Heels', 'Gold Necklace'],
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop',
    occasion: 'Date Night',
    rating: 5.0
  },
  {
    id: '3',
    date: '2024-01-13',
    items: ['White T-Shirt', 'Blue Jeans', 'White Sneakers'],
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
    occasion: 'Casual Weekend',
    rating: 4.0
  }
];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'Style Explorer',
    description: 'Try 10 different outfit combinations',
    icon: 'star.fill',
    unlocked: true
  },
  {
    id: '2',
    title: 'Sustainable Shopper',
    description: 'Add 5 sustainable items to wardrobe',
    icon: 'leaf.fill',
    unlocked: true
  },
  {
    id: '3',
    title: 'Trend Setter',
    description: 'Create 20 unique outfits',
    icon: 'crown.fill',
    unlocked: false,
    progress: 15,
    maxProgress: 20
  },
  {
    id: '4',
    title: 'Virtual Try-On Master',
    description: 'Use virtual try-on 25 times',
    icon: 'camera.fill',
    unlocked: false,
    progress: 8,
    maxProgress: 25
  }
];

const mockFashionStats: FashionStats = {
  totalOutfits: 47,
  favoriteColor: 'Black',
  mostWornItem: 'White Cotton T-Shirt',
  styleScore: 87,
  sustainabilityScore: 92,
  itemsAddedThisMonth: 3
};

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
 * Style Insights Section
 * Shows AI-powered style analytics and trends
 */
const StyleInsightsSection: FC<{ colors: ColorScheme }> = ({ colors }) => (
  <View style={[styles.section, { backgroundColor: colors.background }]}>
    <View style={styles.sectionHeader}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Style Insights
      </ThemedText>
      <TouchableOpacity onPress={() => router.push('/style-insights')}>
        <ThemedText style={[styles.viewAllText, { color: colors.tint }]}>
          View All
        </ThemedText>
      </TouchableOpacity>
    </View>
    
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.insightsScroll}>
      {mockStyleInsights.map((insight) => (
        <View key={insight.id} style={[styles.insightCard, { backgroundColor: colors.background }]}>
          <View style={styles.insightHeader}>
            <IconSymbol 
              name={insight.icon}
              size={20} 
              color={insight.trend === 'up' ? '#4CAF50' : insight.trend === 'down' ? '#FF5722' : colors.tint} 
            />
            <ThemedText style={[styles.insightValue, { color: colors.tint }]}>
              {insight.value}
            </ThemedText>
          </View>
          <ThemedText style={styles.insightTitle}>{insight.title}</ThemedText>
          <ThemedText style={[styles.insightDescription, { color: colors.tabIconDefault }]}>
            {insight.description}
          </ThemedText>
        </View>
      ))}
    </ScrollView>
  </View>
);

/**
 * Fashion Statistics Section
 * Shows comprehensive wardrobe and style metrics
 */
const FashionStatsSection: FC<{ colors: ColorScheme; stats: FashionStats }> = ({ colors, stats }) => (
  <View style={[styles.section, { backgroundColor: colors.background }]}>
    <ThemedText type="subtitle" style={styles.sectionTitle}>
      Fashion Analytics
    </ThemedText>
    
    <View style={styles.statsGrid}>
      <View style={[styles.statItem, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.statNumber, { color: colors.tint }]}>
          {stats.totalOutfits}
        </ThemedText>
        <ThemedText style={[styles.statLabel, { color: colors.tabIconDefault }]}>
          Total Outfits
        </ThemedText>
      </View>
      
      <View style={[styles.statItem, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.statNumber, { color: colors.tint }]}>
          {stats.styleScore}%
        </ThemedText>
        <ThemedText style={[styles.statLabel, { color: colors.tabIconDefault }]}>
          Style Score
        </ThemedText>
      </View>
      
      <View style={[styles.statItem, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.statNumber, { color: colors.tint }]}>
          {stats.sustainabilityScore}%
        </ThemedText>
        <ThemedText style={[styles.statLabel, { color: colors.tabIconDefault }]}>
          Sustainability
        </ThemedText>
      </View>
      
      <View style={[styles.statItem, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.statNumber, { color: colors.tint }]}>
          {stats.itemsAddedThisMonth}
        </ThemedText>
        <ThemedText style={[styles.statLabel, { color: colors.tabIconDefault }]}>
          Items Added This Month
        </ThemedText>
      </View>
    </View>

    <View style={styles.quickStats}>
      <View style={styles.quickStatItem}>
        <IconSymbol name="paintpalette" size={16} color={colors.tint} />
        <ThemedText style={[styles.quickStatText, { color: colors.text }]}>
          Favorite Color: {stats.favoriteColor}
        </ThemedText>
      </View>
      <View style={styles.quickStatItem}>
        <IconSymbol name="star.fill" size={16} color={colors.tint} />
        <ThemedText style={[styles.quickStatText, { color: colors.text }]}>
          Most Worn: {stats.mostWornItem}
        </ThemedText>
      </View>
    </View>
  </View>
);

/**
 * Outfit History Section
 * Shows recent outfit combinations and ratings
 */
const OutfitHistorySection: FC<{ colors: ColorScheme }> = ({ colors }) => (
  <View style={[styles.section, { backgroundColor: colors.background }]}>
    <View style={styles.sectionHeader}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Recent Outfits
      </ThemedText>
      <TouchableOpacity onPress={() => router.push('/outfit-history')}>
        <ThemedText style={[styles.viewAllText, { color: colors.tint }]}>
          View All
        </ThemedText>
      </TouchableOpacity>
    </View>
    
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.outfitScroll}>
      {mockOutfitHistory.map((outfit) => (
        <TouchableOpacity key={outfit.id} style={[styles.outfitCard, { backgroundColor: colors.background }]}>
          <Image source={{ uri: outfit.imageUrl }} style={styles.outfitImage} />
          <View style={styles.outfitInfo}>
            <ThemedText style={styles.outfitDate}>{outfit.date}</ThemedText>
            <ThemedText style={[styles.outfitOccasion, { color: colors.tabIconDefault }]}>
              {outfit.occasion}
            </ThemedText>
            <View style={styles.outfitRating}>
              <IconSymbol name="star.fill" size={12} color="#FFD700" />
              <ThemedText style={styles.ratingText}>{outfit.rating}</ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

/**
 * Achievements Section
 * Shows fashion-related achievements and progress
 */
const AchievementsSection: FC<{ colors: ColorScheme }> = ({ colors }) => (
  <View style={[styles.section, { backgroundColor: colors.background }]}>
    <ThemedText type="subtitle" style={styles.sectionTitle}>
      Achievements
    </ThemedText>
    
    <View style={styles.achievementsGrid}>
      {mockAchievements.map((achievement) => (
        <TouchableOpacity 
          key={achievement.id} 
          style={[
            styles.achievementCard, 
            { 
              backgroundColor: colors.background,
              opacity: achievement.unlocked ? 1 : 0.6
            }
          ]}
        >
          <View style={[
            styles.achievementIcon, 
            { backgroundColor: achievement.unlocked ? colors.tint : colors.tabIconDefault }
          ]}>
            <IconSymbol 
              name={achievement.icon}
              size={24} 
              color="white" 
            />
          </View>
          <View style={styles.achievementInfo}>
            <ThemedText style={[
              styles.achievementTitle,
              { color: achievement.unlocked ? colors.text : colors.tabIconDefault }
            ]}>
              {achievement.title}
            </ThemedText>
            <ThemedText style={[styles.achievementDescription, { color: colors.tabIconDefault }]}>
              {achievement.description}
            </ThemedText>
            {!achievement.unlocked && achievement.progress && (
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill, 
                  { 
                    width: `${achievement.maxProgress ? (achievement.progress / achievement.maxProgress) * 100 : 0}%`,
                    backgroundColor: colors.tint
                  }
                ]} />
              </View>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
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
  accountMode: 'individual' | 'boutique';
  onToggleAccountMode: () => void;
}> = ({ preferences, colors, toggleBackgroundPreference, toggleNotifications, accountMode, onToggleAccountMode }) => (
  <View style={[styles.section, { backgroundColor: colors.background }]}>
    <Text style={[styles.sectionTitle, { color: colors.text }]}>
      Preferences
    </Text>

    {/* Account Mode Toggle */}
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceInfo}>
        <Text style={[styles.preferenceTitle, { color: colors.text }]}>
          Account Mode
        </Text>
        <Text style={[styles.preferenceDescription, { color: colors.tabIconDefault }]}>
          Switch between Individual and Boutique modes
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.toggleButton, { backgroundColor: colors.tint }]}
        onPress={onToggleAccountMode}
      >
        <Text style={styles.toggleButtonText}>
          {accountMode === 'individual' ? 'Individual' : 'Boutique'}
        </Text>
      </TouchableOpacity>
    </View>

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
const SettingsSection: FC<{ colors: ColorScheme; handleLogout: () => void }> = ({ colors, handleLogout }) => {
  const handleCompleteProfile = () => {
    router.push('/profile-completion');
  };

  return (
    <View style={[styles.section, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Settings
      </Text>

      <TouchableOpacity style={styles.settingItem} onPress={handleCompleteProfile}>
        <IconSymbol name="person.text.rectangle" size={20} color={colors.tint} />
        <Text style={[styles.settingText, { color: colors.text }]}>
          Complete Profile
        </Text>
        <IconSymbol name="chevron.right" size={16} color={colors.tabIconDefault} />
      </TouchableOpacity>

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
};

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
  const { userType, setUserType } = useUserType();
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

  /**
   * Handle account mode switch
   * Allows users to switch between Individual and Boutique modes
   */
  const handleToggleAccountMode = () => {
    console.log('handleToggleAccountMode called, current userType:', userType);
    
    // If no user type is set, show alert to complete onboarding first
    if (!userType) {
      console.log('No user type, showing onboarding alert');
      setTimeout(() => {
        Alert.alert(
          'Complete Onboarding First',
          'Please complete the onboarding process to select your account mode. You\'ll be redirected to the onboarding screen.',
          [
          { 
            text: 'Cancel', 
            style: 'cancel'
          },
          { 
            text: 'Go to Onboarding', 
            onPress: () => {
              router.replace('/onboarding');
            }
          }
        ]
      );
      }, 100);
      return;
    }
    
    const newMode = userType === 'individual' ? 'boutique' : 'individual';
    console.log('Switching to mode:', newMode);
    
    // Use setTimeout to ensure Alert is shown after current execution context
    setTimeout(() => {
      Alert.alert(
        'Switch Account Mode',
        `Switch to ${newMode === 'individual' ? 'Individual' : 'Boutique'} mode? You can always switch back.`,
        [
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => console.log('Cancelled mode switch')
          },
          { 
            text: 'Switch', 
            onPress: async () => {
              console.log('Switching to mode:', newMode);
              try {
                await setUserType(newMode);
                console.log('User type set, navigating...');
                // Navigate to appropriate tabs based on new mode
                if (newMode === 'individual') {
                  router.replace('/(tabs)');
                } else {
                  router.replace('/(boutique-tabs)/dashboard');
                }
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <ProfileSection user={user} colors={colors} />
        <StyleInsightsSection colors={colors} />
        <FashionStatsSection colors={colors} stats={mockFashionStats} />
        <OutfitHistorySection colors={colors} />
        <AchievementsSection colors={colors} />
        <PreferencesSection 
          preferences={preferences} 
          colors={colors} 
          toggleBackgroundPreference={toggleBackgroundPreference}
          toggleNotifications={toggleNotifications}
          accountMode={userType || 'individual'}
          onToggleAccountMode={handleToggleAccountMode}
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
  // Enhanced Profile Styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Style Insights Styles
  insightsScroll: {
    paddingRight: 20,
  },
  insightCard: {
    width: 160,
    marginRight: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  // Fashion Stats Styles
  quickStats: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
  },
  quickStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickStatText: {
    fontSize: 14,
    marginLeft: 8,
  },
  // Outfit History Styles
  outfitScroll: {
    paddingRight: 20,
  },
  outfitCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outfitImage: {
    width: '100%',
    height: 100,
  },
  outfitInfo: {
    padding: 12,
  },
  outfitDate: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  outfitOccasion: {
    fontSize: 11,
    marginBottom: 6,
  },
  outfitRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  // Achievements Styles
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});