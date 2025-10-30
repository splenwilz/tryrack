import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useWardrobeItems, useUpdateWardrobeItemStatus } from '@/hooks/useWardrobe';
import { useUser } from '@/hooks/useAuthQuery';

// Legacy interface for compatibility with existing code
interface WardrobeItemCard {
  id: string;
  title: string;
  category: string;
  price?: number;
  imageUrl: string;
  colors: string[];
  tags: string[];
  status: 'clean' | 'dirty' | 'worn';
  created_at?: string;
}



// Wardrobe Item Card Component - displays personal wardrobe items with status management
const WardrobeItemCard: React.FC<{ 
  item: WardrobeItemCard; 
  onStatusChange?: (itemId: string, newStatus: 'clean' | 'worn') => void;
}> = ({ item, onStatusChange }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  const handleItemPress = () => {
    router.push(`/wardrobe-item-detail?itemId=${item.id}`);
  };
  
  const getStatusBadge = () => {
    if (item.status === 'worn') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: '#FF9500', opacity: 0.9 }]}>
          <IconSymbol name="tshirt.fill" size={10} color="white" />
          <ThemedText style={styles.statusText}>Worn</ThemedText>
        </View>
      );
    }
    if (item.status === 'dirty') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: '#FF3B30', opacity: 0.9 }]}>
          <IconSymbol name="exclamationmark.circle.fill" size={10} color="white" />
          <ThemedText style={styles.statusText}>Dirty</ThemedText>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: '#34C759', opacity: 0.9 }]}>
        <IconSymbol name="checkmark.circle.fill" size={10} color="white" />
        <ThemedText style={styles.statusText}>Clean</ThemedText>
      </View>
    );
  };
  
  return (
    <TouchableOpacity 
      style={[styles.itemCard, { backgroundColor }]}
      onPress={handleItemPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      {getStatusBadge()}
      <View style={styles.itemDetails}>
        <ThemedText style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <View style={styles.itemTags}>
          {item.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tag}>
              <ThemedText style={styles.tagText}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Wardrobe Carousel Component - horizontal scrollable list of wardrobe items
const WardrobeCarousel: React.FC<{ 
  title: string; 
  items: WardrobeItemCard[]; 
  onViewAll?: () => void;
  onStatusChange?: (itemId: string, newStatus: 'clean' | 'worn') => void;
  style?: object;
}> = ({ title, items, onViewAll, onStatusChange, style }) => {
  const tintColor = useThemeColor({}, 'tint');
  
  return (
    <View style={[styles.carouselContainer, style]}>
      <View style={styles.carouselHeader}>
        <ThemedText type="subtitle" style={styles.carouselTitle}>{title}</ThemedText>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <ThemedText style={[styles.viewAllText, { color: tintColor }]}>View All</ThemedText>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
      >
        {items.map((item) => (
          <WardrobeItemCard key={item.id} item={item} onStatusChange={onStatusChange} />
        ))}
      </ScrollView>
    </View>
  );
};

// Featured Wardrobe Item Component - larger display for featured items
const FeaturedWardrobeItem: React.FC<{ item: WardrobeItemCard }> = ({ item }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  return (
    <TouchableOpacity style={[styles.featuredCard, { backgroundColor }]}>
      <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} />
      <View style={styles.featuredContent}>
        <ThemedText type="subtitle" style={styles.featuredTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.featuredDescription}>
          Perfect for your next outfit
        </ThemedText>
        <View style={styles.featuredTags}>
          {item.tags.map((tag: string) => (
            <View key={tag} style={[styles.featuredTag, { backgroundColor: tintColor }]}>
              <ThemedText style={styles.featuredTagText}>{tag}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Empty Wardrobe State Component - shown when wardrobe is empty
const EmptyWardrobeState: React.FC = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  const handleAddFirstItem = () => {
    router.push('/add-item');
  };
  
  const handleAddItem = () => {
    router.push('/add-item');
  };
  
  return (
    <View style={[styles.emptyState, { backgroundColor }]}>
      <View style={styles.emptyStateIcon}>
        <ThemedText style={styles.emptyStateEmoji}>👕</ThemedText>
      </View>
      <ThemedText type="title" style={styles.emptyStateTitle}>
        Your Wardrobe is Empty
      </ThemedText>
      <ThemedText style={styles.emptyStateDescription}>
        Start building your digital wardrobe by adding your favorite clothing items.
      </ThemedText>
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: tintColor }]}
        onPress={handleAddFirstItem}
      >
        <ThemedText style={styles.addButtonText}>Add Your First Item</ThemedText>
      </TouchableOpacity>
      
      <View style={styles.quickTips}>
        <ThemedText style={styles.quickTipsTitle}>Quick Tips:</ThemedText>
        <ThemedText style={styles.quickTip}>• Take photos of your clothes</ThemedText>
        <ThemedText style={styles.quickTip}>• Organize by categories</ThemedText>
        <ThemedText style={styles.quickTip}>• Get outfit recommendations</ThemedText>
      </View>
    </View>
  );
};

/**
 * Wardrobe Screen Component
 * Displays user's personal wardrobe with categorized items and empty state
 * Based on blueprint requirements for wardrobe management
 */
export default function WardrobeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  // Get current user
  const { data: user } = useUser();
  const userId = user?.id ?? 0; // Wait for real authenticated user
  
  // Fetch wardrobe items from API
  const { data: apiItems = [], isLoading, error } = useWardrobeItems(userId);
  const updateStatusMutation = useUpdateWardrobeItemStatus();
  
  // Convert API items to display format (compatible with existing components)
  const wardrobeItems: WardrobeItemCard[] = apiItems.map(item => ({
    id: item.id.toString(),
    title: item.title,
    category: item.category,
    price: item.price,
    imageUrl: item.image_clean || item.image_original || 'https://via.placeholder.com/150',
    colors: item.colors || [],
    tags: item.tags || [],
    status: item.status,
    created_at: item.created_at,
  }));
  
  // Handler for status changes
  const handleStatusChange = async (itemId: string, newStatus: 'clean' | 'worn') => {
    try {
      await updateStatusMutation.mutateAsync({
        itemId: parseInt(itemId),
        userId,
        status: newStatus,
      });
      
      if (newStatus === 'worn') {
        Alert.alert('Item Updated', 'Item marked as worn. Clean it to use in recommendations again.');
      } else {
        Alert.alert('Item Updated', 'Item marked as clean and ready for recommendations.');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert('Error', 'Failed to update item status. Please try again.');
    }
  };
  
  // 🏷️ Group items by dynamic category (from Gemini)
  const groupedByCategory = React.useMemo(() => {
    const groups: Record<string, WardrobeItemCard[]> = {};
    
    wardrobeItems.forEach(item => {
      // Only group clean items; worn items go into their own section
      // Also exclude "processing" category items
      if (item.status === 'clean' && item.category !== 'processing') {
        const category = item.category.toLowerCase().trim(); // Normalize
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
      }
    });
    
    // Sort categories by item count (descending)
    const sortedCategories = Object.keys(groups).sort((a, b) => 
      groups[b].length - groups[a].length
    );
    
    return { groups, sortedCategories };
  }, [wardrobeItems]);
  
  const wornItems = wardrobeItems.filter(item => item.status === 'worn');
  
  // Featured item (first item from largest category)
  const featuredItem = groupedByCategory.sortedCategories.length > 0 
    ? groupedByCategory.groups[groupedByCategory.sortedCategories[0]][0] 
    : null;

  // Mock notification count - in real app this would come from state/API
  const notificationCount = 3;

  const handleSearchPress = () => {
    console.log('Search pressed - implement search functionality');
    // TODO: Navigate to search screen
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed - implement notification screen');
    // TODO: Navigate to notifications screen
  };

  const handleViewAll = (category: string) => {
    console.log(`View all ${category} pressed`);
    router.push(`/category?category=${category}`);
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader
          title="My Wardrobe"
          onSearchPress={handleSearchPress}
          onNotificationPress={handleNotificationPress}
          notificationCount={notificationCount}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading your wardrobe...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader
          title="My Wardrobe"
          onSearchPress={handleSearchPress}
          onNotificationPress={handleNotificationPress}
          notificationCount={notificationCount}
        />
        <View style={styles.loadingContainer}>
          <ThemedText type="title" style={styles.errorText}>Error loading wardrobe</ThemedText>
          <ThemedText style={styles.errorDescription}>
            Please check your connection and try again.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no items (for new users)
  if (wardrobeItems.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader
          title="My Wardrobe"
          onSearchPress={handleSearchPress}
          onNotificationPress={handleNotificationPress}
          notificationCount={notificationCount}
        />
        <EmptyWardrobeState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="My Wardrobe"
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        notificationCount={notificationCount}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Featured Item */}
        {featuredItem && featuredItem.imageUrl && (
          <View style={styles.featuredSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Featured</ThemedText>
            <FeaturedWardrobeItem item={featuredItem} />
          </View>
        )}

        {/* Recently Added - Exclude processing items, sort by newest first */}
        {(() => {
          const recentItems = wardrobeItems
            .filter(item => item.category !== 'processing' && item.status === 'clean')
            .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
            .slice(0, 4);
          
          return recentItems.length > 0 && (
            <WardrobeCarousel
              title="Recently Added"
              items={recentItems}
              onViewAll={() => handleViewAll('recent')}
              style={!featuredItem ? { marginTop: 24 } : undefined}
            />
          );
        })()}

        {/* 🏷️ Dynamic Category Sections - Auto-generated by Gemini */}
        {groupedByCategory.sortedCategories.map((category) => {
          const items = groupedByCategory.groups[category];
          // Capitalize category name for display (e.g., "denim jacket" → "Denim Jacket")
          const displayTitle = category
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          // Only add 's' if category doesn't already end in 's' (avoid "chinoss", "jeanss")
          const pluralSuffix = category.endsWith('s') ? '' : 's';
          
          return (
            <WardrobeCarousel
              key={category}
              title={`${displayTitle}${pluralSuffix} (${items.length})`}
              items={items}
              onViewAll={() => handleViewAll(category)}
              onStatusChange={handleStatusChange}
            />
          );
        })}

        {/* Worn Items Section */}
        {wornItems.length > 0 && (
          <View style={styles.wornSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Worn Items</ThemedText>
            <ThemedText style={styles.subtitle}>
              Clean these items to use in outfit recommendations
            </ThemedText>
            <View style={styles.wornGrid}>
              {wornItems.map((item) => (
                <View key={item.id} style={[styles.wornCard, { backgroundColor }]}>
                  <Image source={{ uri: item.imageUrl }} style={styles.wornCardImage} />
                  <View style={styles.wornCardInfo}>
                    <ThemedText style={styles.wornCardTitle} numberOfLines={2}>
                      {item.title}
                    </ThemedText>
                    <TouchableOpacity
                      style={[styles.cleanButton, { backgroundColor: tintColor }]}
                      onPress={() => handleStatusChange(item.id, 'clean')}
                    >
                      <IconSymbol name="checkmark.circle.fill" size={14} color="white" />
                      <ThemedText style={styles.cleanButtonText}>Mark Clean</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: tintColor },
        ]}
        onPress={() => router.push('/add-item')}
      >
        <IconSymbol name="plus" size={24} color="white" />
      </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  // Featured Item Styles
  featuredSection: {
    marginBottom: 32,
    marginTop: 20,
  },
  featuredCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  featuredTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featuredTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  featuredTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  // Carousel Styles
  carouselContainer: {
    marginBottom: 32,
  },
  carouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  carouselTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  carouselContent: {
    paddingRight: 20,
  },
  // Item Card Styles
  itemCard: {
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
  itemImage: {
    width: '100%',
    height: 140,
  },
  itemDetails: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  itemTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    opacity: 0.8,
  },
  // Empty State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateEmoji: {
    fontSize: 48,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
    marginBottom: 32,
  },
  addButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 32,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  quickTips: {
    alignItems: 'flex-start',
  },
  quickTipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickTip: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Status Management Styles
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    zIndex: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  // Worn Items Section
  wornSection: {
    marginTop: 32,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  wornGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  wornCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wornCardImage: {
    width: '100%',
    height: 120,
  },
  wornCardInfo: {
    padding: 12,
  },
  wornCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  cleanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 6,
  },
  cleanButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Loading & Error States
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
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  errorDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});