import type React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import type { BoutiqueItem } from '@/lib/boutiqueData';
import { useWardrobeItems } from '@/hooks/useWardrobe';
import { useUser } from '@/hooks/useAuthQuery';
import { useMemo } from 'react';

// Interfaces for home feed data
interface OutfitRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  weather: string;
  occasion: string;
  items: {
    id: string;
    title: string;
    imageUrl: string;
    category: string;
  }[];
  reasons: string[];
}

interface WardrobeHighlight {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  lastWorn?: string;
  wearCount: number;
  isNew: boolean;
}

interface BoutiqueDiscovery extends BoutiqueItem {
  isTrending: boolean;
  discount?: number;
}

// Mock data for home feed
const mockOutfitRecommendations: OutfitRecommendation[] = [
  {
    id: '1',
    title: 'Perfect for Today',
    description: '28°C and sunny - ideal for your meeting',
    confidence: 0.92,
    weather: '28°C, Sunny',
    occasion: 'Work Meeting',
    items: [
      {
        id: '1',
        title: 'Navy Blouse',
        imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=100&h=100&fit=crop',
        category: 'top'
      },
      {
        id: '4',
        title: 'Dark Jeans',
        imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=100&h=100&fit=crop',
        category: 'bottom'
      },
      {
        id: '10',
        title: 'Black Dress Shoes',
        imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=100&h=100&fit=crop',
        category: 'shoes'
      }
    ],
    reasons: ['Matches your color palette', 'Great for 28°C weather', 'You liked a similar look last month']
  },
  {
    id: '2',
    title: 'Casual Weekend',
    description: 'Comfortable yet stylish for Saturday',
    confidence: 0.87,
    weather: '26°C, Partly Cloudy',
    occasion: 'Weekend Casual',
    items: [
      {
        id: '2',
        title: 'Black Hoodie',
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a8?w=100&h=100&fit=crop',
        category: 'top'
      },
      {
        id: '5',
        title: 'Navy Sweatpants',
        imageUrl: 'https://images.unsplash.com/photo-1506629905607-3a4b4b4b4b4b?w=100&h=100&fit=crop',
        category: 'bottom'
      },
      {
        id: '9',
        title: 'White Sneakers',
        imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=100&h=100&fit=crop',
        category: 'shoes'
      }
    ],
    reasons: ['Perfect for weekend vibes', 'Comfortable for all-day wear', 'Matches your casual style']
  }
];

// Helper function to format last worn date
const formatLastWornDate = (lastWornAt?: string): string | undefined => {
  if (!lastWornAt) return undefined;
  
  const date = new Date(lastWornAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

// Helper function to check if item is new (added in last 7 days)
const isItemNew = (createdAt?: string): boolean => {
  if (!createdAt) return false;
  const date = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};

const mockBoutiqueDiscoveries: BoutiqueDiscovery[] = [
  {
    id: '1',
    title: 'Designer Blazer',
    brand: 'Fashion Forward',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=200&h=200&fit=crop',
    price: 45000,
    colors: ['navy', 'black'],
    tags: ['formal', 'business'],
    boutique: {
      id: 'b1',
      name: 'Luxe Boutique',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50&h=50&fit=crop'
    },
    arAvailable: true,
    isTrending: true,
    discount: 20
  },
  {
    id: '2',
    title: 'Silk Evening Dress',
    brand: 'Elegance Co',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop',
    price: 75000,
    colors: ['black', 'navy'],
    tags: ['elegant', 'formal'],
    boutique: {
      id: 'b2',
      name: 'Elegance Co',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50&h=50&fit=crop'
    },
    arAvailable: true,
    isTrending: false
  },
  {
    id: '3',
    title: 'Summer Maxi Dress',
    brand: 'Casual Chic',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0c29b8b0b8c?w=200&h=200&fit=crop',
    price: 35000,
    colors: ['blue', 'pink'],
    tags: ['casual', 'summer'],
    boutique: {
      id: 'b3',
      name: 'Casual Chic',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=50&h=50&fit=crop'
    },
    arAvailable: true,
    isTrending: true,
    discount: 15
  }
];


// Outfit Recommendation Card Component
const OutfitRecommendationCard: React.FC<{ outfit: OutfitRecommendation }> = ({ outfit }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const handleTryOutfit = () => {
    console.log(`Try outfit: ${outfit.title}`);
    // TODO: Navigate to virtual try-on with outfit items
  };

  const handleSaveOutfit = () => {
    console.log(`Save outfit: ${outfit.title}`);
    // TODO: Save outfit to favorites
  };

  return (
    <View style={[styles.outfitCard, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.outfitHeader}>
        <View style={styles.outfitTitleContainer}>
          <ThemedText type="subtitle" style={styles.outfitTitle}>{outfit.title}</ThemedText>
          <ThemedText style={styles.outfitDescription}>{outfit.description}</ThemedText>
        </View>
        <View style={styles.confidenceBadge}>
          <ThemedText style={styles.confidenceText}>{Math.round(outfit.confidence * 100)}%</ThemedText>
        </View>
      </View>

      {/* Items Grid */}
      <View style={styles.itemsGrid}>
        {outfit.items.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
            <ThemedText style={styles.itemTitle} numberOfLines={2}>{item.title}</ThemedText>
          </View>
        ))}
      </View>

      {/* Reasons */}
      <View style={styles.reasonsContainer}>
        <ThemedText style={styles.reasonsTitle}>Why this outfit?</ThemedText>
        {outfit.reasons.map((reason) => (
          <View key={reason} style={styles.reasonItem}>
            <IconSymbol name="plus" size={12} color={tintColor} />
            <ThemedText style={styles.reasonText}>{reason}</ThemedText>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.outfitActions}>
        <TouchableOpacity 
          style={[styles.tryButton, { backgroundColor: tintColor }]} 
          onPress={handleTryOutfit}
        >
          <IconSymbol name="plus" size={16} color="white" />
          <ThemedText style={styles.tryButtonText}>Try Virtually</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveOutfit}>
          <IconSymbol name="heart.fill" size={16} color={iconColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Wardrobe Highlight Card Component
const WardrobeHighlightCard: React.FC<{ item: WardrobeHighlight }> = ({ item }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const handleViewItem = () => {
    router.push(`/wardrobe-item-detail?itemId=${item.id}`);
  };

  return (
    <TouchableOpacity style={[styles.highlightCard, { backgroundColor }]} onPress={handleViewItem}>
      <View style={styles.highlightImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.highlightImage} />
        {item.isNew && (
          <View style={[styles.newBadge, { backgroundColor: tintColor }]}>
            <ThemedText style={styles.newBadgeText}>NEW</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.highlightInfo}>
        <ThemedText style={styles.highlightTitle} numberOfLines={2}>{item.title}</ThemedText>
        <ThemedText style={styles.highlightStats}>
          Worn {item.wearCount} times
        </ThemedText>
        {item.lastWorn && (
          <ThemedText style={styles.highlightLastWorn}>
            Last worn: {item.lastWorn}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
};

// Boutique Discovery Card Component
const BoutiqueDiscoveryCard: React.FC<{ item: BoutiqueDiscovery }> = ({ item }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const handleViewItem = () => {
    console.log(`View boutique item: ${item.title}`);
    router.push(`/virtual-tryon?itemId=${item.id}`);
  };

  const handleAddToWishlist = () => {
    console.log(`Add to wishlist: ${item.title}`);
    // TODO: Add to wishlist
  };

  return (
    <View pointerEvents="box-none">
      <TouchableOpacity 
        style={[styles.discoveryCard, { backgroundColor }]} 
        onPress={handleViewItem}
      >
      <View style={styles.discoveryImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.discoveryImage} />
        {item.isTrending && (
          <View style={[styles.trendingBadge, { backgroundColor: tintColor }]}>
            <ThemedText style={styles.trendingBadgeText}>🔥 TRENDING</ThemedText>
          </View>
        )}
        {item.discount && (
          <View style={styles.discountBadge}>
            <ThemedText style={styles.discountBadgeText}>-{item.discount}%</ThemedText>
          </View>
        )}
        <TouchableOpacity 
          style={styles.wishlistButton} 
          onPress={handleAddToWishlist}
        >
          <IconSymbol name="heart.fill" size={16} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>
      <View style={styles.discoveryInfo}>
        <ThemedText style={styles.discoveryBrand}>{item.brand}</ThemedText>
        <ThemedText style={styles.discoveryTitle} numberOfLines={2}>{item.title}</ThemedText>
        <View style={styles.discoveryPriceContainer}>
          <ThemedText style={styles.discoveryPrice}>₦{item.price.toLocaleString()}</ThemedText>
          {item.discount && (
            <ThemedText style={styles.originalPrice}>
              ₦{Math.round(item.price / (1 - item.discount / 100)).toLocaleString()}
            </ThemedText>
          )}
        </View>
        <View style={styles.boutiqueInfo}>
          <Image source={{ uri: item.boutique.logo }} style={styles.boutiqueLogo} />
          <ThemedText style={styles.boutiqueName}>{item.boutique.name}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
    </View>
  );
};

/**
 * Home Tab Screen Component
 * Personalized fashion feed with outfit recommendations, wardrobe highlights, and boutique discoveries
 * Based on blueprint requirements for AI-powered daily style inspiration
 */
export default function HomeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Get current user
  const { data: user } = useUser();
  const userId = user?.id ?? 0;

  // Fetch wardrobe items from API
  const { data: wardrobeItems = [], isLoading: isLoadingWardrobe } = useWardrobeItems(userId);

  // Transform wardrobe items to highlights format
  const wardrobeHighlights = useMemo(() => {
    if (!wardrobeItems || wardrobeItems.length === 0) return [];

    // Filter out processing items
    const validItems = wardrobeItems.filter(
      item => item.category !== 'processing' && (item.image_clean || item.image_original)
    );

    // Sort by: most worn first, then by newest
    const sorted = [...validItems].sort((a, b) => {
      // First, sort by wear count (descending)
      const aWearCount = a.wear_count || 0;
      const bWearCount = b.wear_count || 0;
      if (aWearCount !== bWearCount) {
        return bWearCount - aWearCount;
      }
      
      // If same wear count, sort by newest (created_at descending)
      const aCreated = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bCreated = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bCreated - aCreated;
    });

    // Take top 6 items (most-worn or newest)
    return sorted.slice(0, 6).map((item): WardrobeHighlight => ({
      id: item.id.toString(),
      title: item.title,
      imageUrl: item.image_clean || item.image_original || '',
      category: item.category,
      lastWorn: formatLastWornDate(item.last_worn_at),
      wearCount: item.wear_count || 0,
      isNew: isItemNew(item.created_at),
    }));
  }, [wardrobeItems]);

  const handleSearchPress = () => {
    console.log('Search pressed - implement search functionality');
    // TODO: Navigate to search screen
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed - implement notification screen');
    // TODO: Navigate to notifications screen
  };

  const handleViewAllWardrobe = () => {
    router.push('/(tabs)/wardrobe');
  };

  const handleViewAllShop = () => {
    router.push('/(tabs)/explore');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Style Feed"
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        {/* <View style={styles.welcomeSection}>
          <ThemedText type="title" style={styles.welcomeTitle}>
            What should you wear today?
          </ThemedText>
          <ThemedText style={styles.welcomeSubtitle}>
            AI-powered outfit recommendations just for you
          </ThemedText>
        </View> */}

        {/* Outfit Recommendations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* <ThemedText type="subtitle" style={styles.sectionTitle}>
              Recommended Outfits
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Personalized for today&apos;s weather and your style
            </ThemedText> */}
          </View>
          {mockOutfitRecommendations.length > 0 ? (
            mockOutfitRecommendations.map((outfit) => (
              <OutfitRecommendationCard key={outfit.id} outfit={outfit} />
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIcon}>
                <ThemedText style={styles.emptyStateEmoji}>👗</ThemedText>
              </View>
              <ThemedText type="subtitle" style={styles.emptyStateTitle}>
                No Outfit Recommendations Yet
              </ThemedText>
              <ThemedText style={styles.emptyStateDescription}>
                Add items to your wardrobe to get personalized outfit suggestions based on your style and the weather.
              </ThemedText>
              <TouchableOpacity 
                style={[styles.emptyStateButton, { backgroundColor: tintColor }]}
                onPress={() => router.push('/(tabs)/wardrobe')}
              >
                <ThemedText style={styles.emptyStateButtonText}>Add to Wardrobe</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Wardrobe Highlights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Your Wardrobe Highlights
              </ThemedText>
              <TouchableOpacity onPress={handleViewAllWardrobe}>
                <ThemedText style={styles.viewAllText}>View All</ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.sectionSubtitle}>
              Your most-worn and newest items
        </ThemedText>
          </View>
          {isLoadingWardrobe ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={tintColor} />
              <ThemedText style={styles.loadingText}>Loading wardrobe...</ThemedText>
            </View>
          ) : wardrobeHighlights.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.highlightsScroll}>
              {wardrobeHighlights.map((item) => (
                <WardrobeHighlightCard key={item.id} item={item} />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIcon}>
                <ThemedText style={styles.emptyStateEmoji}>👕</ThemedText>
              </View>
              <ThemedText type="subtitle" style={styles.emptyStateTitle}>
                Your Wardrobe is Empty
              </ThemedText>
              <ThemedText style={styles.emptyStateDescription}>
                Start building your digital wardrobe by adding your favorite clothing items.
              </ThemedText>
              <TouchableOpacity 
                style={[styles.emptyStateButton, { backgroundColor: tintColor }]}
                onPress={() => router.push('/(tabs)/wardrobe')}
              >
                <ThemedText style={styles.emptyStateButtonText}>Add Your First Item</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Boutique Discoveries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Trending Near You
        </ThemedText>
              <TouchableOpacity onPress={handleViewAllShop}>
                <ThemedText style={styles.viewAllText}>View All</ThemedText>
              </TouchableOpacity>
            </View>
            <ThemedText style={styles.sectionSubtitle}>
              Discover trending items from local boutiques
        </ThemedText>
          </View>
          {mockBoutiqueDiscoveries.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.discoveriesScroll}>
              {mockBoutiqueDiscoveries.map((item) => (
                <BoutiqueDiscoveryCard key={item.id} item={item} />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIcon}>
                <ThemedText style={styles.emptyStateEmoji}>🛍️</ThemedText>
              </View>
              <ThemedText type="subtitle" style={styles.emptyStateTitle}>
                No Trending Items Yet
              </ThemedText>
              <ThemedText style={styles.emptyStateDescription}>
                Discover trending fashion items from local boutiques and designers.
              </ThemedText>
              <TouchableOpacity 
                style={[styles.emptyStateButton, { backgroundColor: tintColor }]}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <ThemedText style={styles.emptyStateButtonText}>Explore Boutiques</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: tintColor }]}
              onPress={() => router.push('/(tabs)/wardrobe')}
            >
              <IconSymbol name="tshirt.fill" size={24} color="white" />
              <ThemedText style={styles.quickActionText}>Add to Wardrobe</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: tintColor }]}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <IconSymbol name="bag.fill" size={24} color="white" />
              <ThemedText style={styles.quickActionText}>Shop Boutiques</ThemedText>
            </TouchableOpacity>
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
  welcomeSection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  // Outfit Recommendation Styles
  outfitCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  outfitTitleContainer: {
    flex: 1,
  },
  outfitTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  outfitDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  confidenceBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  reasonsContainer: {
    marginBottom: 16,
  },
  reasonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    marginLeft: 8,
    opacity: 0.8,
  },
  outfitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
  },
  tryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Wardrobe Highlights Styles
  highlightsScroll: {
    paddingRight: 20,
  },
  highlightCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  highlightImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  highlightImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  newBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  highlightInfo: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  highlightStats: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 2,
  },
  highlightLastWorn: {
    fontSize: 10,
    opacity: 0.6,
  },
  // Boutique Discoveries Styles
  discoveriesScroll: {
    paddingRight: 20,
  },
  discoveryCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  discoveryImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  discoveryImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  trendingBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendingBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  discountBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  wishlistButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discoveryInfo: {
    flex: 1,
  },
  discoveryBrand: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 2,
  },
  discoveryTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  discoveryPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  discoveryPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  boutiqueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boutiqueLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  boutiqueName: {
    fontSize: 11,
    opacity: 0.7,
  },
  // Quick Actions Styles
  quickActions: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Empty State Styles
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateEmoji: {
    fontSize: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 280,
  },
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
});