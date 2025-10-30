import { StyleSheet, View, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { router } from 'expo-router';

// Wardrobe item interface (same as in wardrobe.tsx)
interface WardrobeItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  colors: string[];
  tags: string[];
}

interface CategoryViewProps {
  category: string;
  items: WardrobeItem[];
  isLoading?: boolean;
  error?: unknown;
}

// Wardrobe Item Card Component - displays individual wardrobe items
const WardrobeItemCard: React.FC<{ item: WardrobeItem }> = ({ item }) => {
  const backgroundColor = useThemeColor({}, 'background');
  
  const handleItemPress = () => {
    router.push(`/wardrobe-item-detail?itemId=${item.id}`);
  };
  
  return (
    <TouchableOpacity 
      style={[styles.itemCard, { backgroundColor }]}
      onPress={handleItemPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <ThemedText style={styles.itemTitle} numberOfLines={2}>
        {item.title}
      </ThemedText>
    </TouchableOpacity>
  );
};

/**
 * Category View Screen Component
 * Displays all items in a specific wardrobe category
 * Used when user taps "View All" on any wardrobe section
 */
export const CategoryViewScreen: React.FC<CategoryViewProps> = ({ category, items, isLoading, error }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  // Format category name for display
  const formatCategoryName = (cat: string): string => {
    if (cat === 'recent') return 'Recently Added';
    const nameMap: Record<string, string> = {
      'tops': 'Tops',
      'bottoms': 'Bottoms',
      'shoes': 'Shoes',
      'outerwear': 'Outerwear',
      'dress': 'Dresses',
      'accessories': 'Accessories',
      'underwear': 'Underwear',
    };
    return nameMap[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  // Handler for adding new items to this category
  const handleAddItem = () => {
    console.log(`Add new ${category} item`);
    router.push('/add-item');
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader
          title={formatCategoryName(category)}
          showBackButton={true}
          onBackPress={() => router.back()}
          onSearchPress={() => console.log('Search in category')}
          onNotificationPress={() => console.log('Notifications')}
          notificationCount={0}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading items...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader
          title={formatCategoryName(category)}
          showBackButton={true}
          onBackPress={() => router.back()}
          onSearchPress={() => console.log('Search in category')}
          onNotificationPress={() => console.log('Notifications')}
          notificationCount={0}
        />
        <View style={styles.errorContainer}>
          <ThemedText type="subtitle" style={styles.errorText}>Error loading items</ThemedText>
          <ThemedText style={styles.errorDescription}>
            Please check your connection and try again.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Custom Header with back button */}
      <CustomHeader
        title={formatCategoryName(category)}
        onSearchPress={() => console.log('Search in category')}
        onNotificationPress={() => console.log('Notifications')}
        notificationCount={0}
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WardrobeItemCard item={item} />}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Category Stats */}
            <View style={styles.statsContainer}>
              <ThemedText style={styles.statsText}>
                {items.length} {items.length === 1 ? 'item' : 'items'} in {formatCategoryName(category)}
              </ThemedText>
            </View>

            {/* Add Item Button */}
            <TouchableOpacity style={styles.addItemButton} onPress={handleAddItem}>
              <ThemedText style={styles.addItemButtonText}>
                + Add New {formatCategoryName(category)} Item
              </ThemedText>
            </TouchableOpacity>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCategoryContainer}>
            <ThemedText style={styles.emptyCategoryIcon}>👕</ThemedText>
            <ThemedText type="subtitle" style={styles.emptyCategoryTitle}>
              No {formatCategoryName(category)} Items Yet
            </ThemedText>
            <ThemedText style={styles.emptyCategoryDescription}>
              Start building your {category} collection by adding your first item.
            </ThemedText>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  statsText: {
    fontSize: 16,
    opacity: 0.7,
  },
  addItemButton: {
    backgroundColor: '#0a7ea4',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addItemButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  gridContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  itemCard: {
    width: '48%',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  itemTitle: {
    padding: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCategoryContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
  emptyCategoryIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyCategoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyCategoryDescription: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
  },
});
