import { StyleSheet, View, FlatList, TouchableOpacity, Image, TextInput, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useState } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';

// Boutique item interface (same as in explore.tsx)
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

interface ShopCategoryViewProps {
  category: string;
  items: BoutiqueItem[];
}

// Filter state interface
interface FilterState {
  brands: string[];
  priceRange: { min: number; max: number };
  sortBy: 'price-low' | 'price-high' | 'newest' | 'popular';
  searchQuery: string;
}

// Mock boutique data (same as in explore.tsx)
// const mockBoutiqueData: BoutiqueItem[] = [
//   {
//     id: '1',
//     title: 'Designer Blazer',
//     brand: 'Fashion Forward',
//     category: 'outerwear',
//     imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=300&h=400&fit=crop',
//     price: 45000,
//     colors: ['navy', 'black'],
//     tags: ['formal', 'business'],
//     boutique: {
//       id: 'b1',
//       name: 'Luxe Boutique',
//       logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
//     },
//     arAvailable: true
//   },
//   {
//     id: '2',
//     title: 'Silk Evening Dress',
//     brand: 'Elegance Co',
//     category: 'dress',
//     imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
//     price: 85000,
//     colors: ['black', 'emerald'],
//     tags: ['formal', 'evening'],
//     boutique: {
//       id: 'b2',
//       name: 'Chic Collection',
//       logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
//     },
//     arAvailable: true
//   },
//   {
//     id: '3',
//     title: 'Casual Denim Jacket',
//     brand: 'Urban Style',
//     category: 'outerwear',
//     imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=400&fit=crop',
//     price: 25000,
//     colors: ['blue', 'black'],
//     tags: ['casual', 'denim'],
//     boutique: {
//       id: 'b3',
//       name: 'Street Fashion',
//       logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
//     },
//     arAvailable: false
//   },
//   {
//     id: '4',
//     title: 'Premium Sneakers',
//     brand: 'Athletic Pro',
//     category: 'shoes',
//     imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
//     price: 35000,
//     colors: ['white', 'black'],
//     tags: ['casual', 'athletic'],
//     boutique: {
//       id: 'b4',
//       name: 'Sport Hub',
//       logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
//     },
//     arAvailable: true
//   },
//   {
//     id: '5',
//     title: 'Luxury Handbag',
//     brand: 'Premium Leather',
//     category: 'accessories',
//     imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
//     price: 120000,
//     colors: ['brown', 'black'],
//     tags: ['luxury', 'leather'],
//     boutique: {
//       id: 'b5',
//       name: 'Elite Accessories',
//       logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
//     },
//     arAvailable: true
//   },
//   {
//     id: '6',
//     title: 'Summer Maxi Dress',
//     brand: 'Boho Chic',
//     category: 'dress',
//     imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
//     price: 32000,
//     colors: ['floral', 'white'],
//     tags: ['casual', 'summer'],
//     boutique: {
//       id: 'b6',
//       name: 'Bohemian Dreams',
//       logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
//     },
//     arAvailable: false
//   },
//   {
//     id: '7',
//     title: 'Business Suit',
//     brand: 'Corporate Elite',
//     category: 'outerwear',
//     imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=300&h=400&fit=crop',
//     price: 95000,
//     colors: ['charcoal', 'navy'],
//     tags: ['formal', 'business'],
//     boutique: {
//       id: 'b7',
//       name: 'Executive Wear',
//       logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
//     },
//     arAvailable: true
//   },
//   {
//     id: '8',
//     title: 'Cocktail Dress',
//     brand: 'Evening Glam',
//     category: 'dress',
//     imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
//     price: 65000,
//     colors: ['red', 'black'],
//     tags: ['formal', 'evening'],
//     boutique: {
//       id: 'b8',
//       name: 'Glamour House',
//       logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
//     },
//     arAvailable: true
//   }
// ];

// Filter Modal Component
const FilterModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  availableBrands: string[];
}> = ({ visible, onClose, filters, onApplyFilters, availableBrands }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      brands: [],
      priceRange: { min: 0, max: 1000000 },
      sortBy: 'newest',
      searchQuery: '',
    };
    setLocalFilters(resetFilters);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.modalTitle}>Filters</ThemedText>
          <TouchableOpacity onPress={handleApply}>
            <ThemedText style={[styles.modalApplyText, { color: tintColor }]}>Apply</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Sort By Section */}
          <View style={styles.filterSection}>
            <ThemedText type="subtitle" style={styles.filterSectionTitle}>Sort By</ThemedText>
            {(['newest', 'price-low', 'price-high', 'popular'] as const).map((sort) => (
              <TouchableOpacity
                key={sort}
                style={styles.filterOption}
                onPress={() => setLocalFilters({ ...localFilters, sortBy: sort })}
              >
                <ThemedText style={styles.filterOptionText}>
                  {sort === 'price-low' ? 'Price: Low to High' :
                   sort === 'price-high' ? 'Price: High to Low' :
                   sort === 'newest' ? 'Newest First' : 'Most Popular'}
                </ThemedText>
                {localFilters.sortBy === sort && (
                  <IconSymbol name="chevron.right" size={16} color={tintColor} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Brand Filter Section */}
          <View style={styles.filterSection}>
            <ThemedText type="subtitle" style={styles.filterSectionTitle}>Brands</ThemedText>
            {availableBrands.map((brand) => (
              <TouchableOpacity
                key={brand}
                style={styles.filterOption}
                onPress={() => {
                  const newBrands = localFilters.brands.includes(brand)
                    ? localFilters.brands.filter(b => b !== brand)
                    : [...localFilters.brands, brand];
                  setLocalFilters({ ...localFilters, brands: newBrands });
                }}
              >
                <ThemedText style={styles.filterOptionText}>{brand}</ThemedText>
                {localFilters.brands.includes(brand) && (
                  <IconSymbol name="chevron.right" size={16} color={tintColor} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Price Range Section */}
          <View style={styles.filterSection}>
            <ThemedText type="subtitle" style={styles.filterSectionTitle}>Price Range</ThemedText>
            <View style={styles.priceRangeContainer}>
              <TextInput
                style={[styles.priceInput, { color: useThemeColor({}, 'text') }]}
                placeholder="Min"
                value={localFilters.priceRange.min.toString()}
                onChangeText={(text) => {
                  const numValue = parseInt(text);
                  const validValue = Number.isNaN(numValue) ? 0 : Math.max(0, numValue);
                  setLocalFilters({
                    ...localFilters,
                    priceRange: { ...localFilters.priceRange, min: validValue }
                  });
                }}
                keyboardType="numeric"
              />
              <ThemedText style={styles.priceRangeText}>to</ThemedText>
              <TextInput
                style={[styles.priceInput, { color: useThemeColor({}, 'text') }]}
                placeholder="Max"
                value={localFilters.priceRange.max.toString()}
                onChangeText={(text) => {
                  const numValue = parseInt(text);
                  const validValue = Number.isNaN(numValue) ? 1000000 : Math.max(0, numValue);
                  setLocalFilters({
                    ...localFilters,
                    priceRange: { ...localFilters.priceRange, max: validValue }
                  });
                }}
                keyboardType="numeric"
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <ThemedText style={styles.resetButtonText}>Reset Filters</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

// Boutique Item Card Component
const BoutiqueItemCard: React.FC<{ item: BoutiqueItem }> = ({ item }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const handleTryOn = () => {
    console.log(`Try virtually ${item.title}`);
    router.push(`/virtual-tryon?itemId=${item.id}`);
  };

  const handleViewDetails = () => {
    console.log(`View details for ${item.title}`);
    // TODO: Navigate to product details
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  };

  return (
    <TouchableOpacity style={[styles.itemCard, { backgroundColor }]} onPress={handleViewDetails}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      
      {/* Boutique Logo */}
      <View style={styles.boutiqueLogo}>
        <Image source={{ uri: item.boutique.logo }} style={styles.logoImage} />
      </View>

      {/* Wishlist Button */}
      <TouchableOpacity style={styles.wishlistButton} onPress={handleWishlistToggle}>
        <IconSymbol 
          name="heart.fill" 
          size={20} 
          color={isInWishlist(item.id) ? '#ff4444' : 'rgba(255,255,255,0.8)'} 
        />
      </TouchableOpacity>

      <View style={styles.itemDetails}>
        <ThemedText style={styles.brandName}>{item.brand}</ThemedText>
        <ThemedText style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.price}>₦{item.price.toLocaleString()}</ThemedText>
        
        {/* Try-On Button */}
        <TouchableOpacity 
          style={[styles.tryOnButton, { backgroundColor: tintColor }]} 
          onPress={handleTryOn}
        >
          <IconSymbol name="plus" size={16} color="white" />
          <ThemedText style={styles.tryOnButtonText}>
            Try Virtually
          </ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Shop Category View Screen Component
 * Displays all boutique items in a specific category with enhanced filtering and sorting
 * Used when user taps "View All" on any shop category section
 */
export const ShopCategoryViewScreen: React.FC<ShopCategoryViewProps> = ({ category, items }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    brands: [],
    priceRange: { min: 0, max: 1000000 },
    sortBy: 'newest',
    searchQuery: '',
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Format category name for display
  const formatCategoryName = (cat: string): string => {
    if (cat === 'all') return 'All Items';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  // Get available brands from items
  const availableBrands = Array.from(new Set(items.map(item => item.brand)));

  // Filter and sort items based on current filters
  const filteredItems = items
    .filter(item => {
      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(item.brand)) {
        return false;
      }
      // Price range filter
      if (item.price < filters.priceRange.min || item.price > filters.priceRange.max) {
        return false;
      }
      // Search query filter
      if (filters.searchQuery && !item.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
          !item.brand.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return b.id.localeCompare(a.id); // Simple newest by ID
        case 'popular':
          return Math.random() - 0.5; // Random for demo
        default:
          return 0;
      }
    });

  // Handler for adding new items to this category
  const handleSearch = () => {
    console.log(`Search in ${category} category`);
    // TODO: Implement category-specific search
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Custom Header with back button */}
      <CustomHeader
        title={formatCategoryName(category)}
        onSearchPress={handleSearch}
        onNotificationPress={() => console.log('Notifications')}
        notificationCount={0}
        showBackButton={true}
        onBackPress={() => router.back()}
      />

      <FlatList
        data={filteredItems}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BoutiqueItemCard item={item} />}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Category Stats */}
            <View style={styles.statsContainer}>
              <ThemedText style={styles.statsText}>
                {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} in {formatCategoryName(category)}
              </ThemedText>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <IconSymbol name="magnifyingglass" size={20} color={iconColor} />
                <TextInput
                  style={[styles.searchInput, { color: useThemeColor({}, 'text') }]}
                  placeholder={`Search ${formatCategoryName(category)}...`}
                  placeholderTextColor={iconColor}
                  value={filters.searchQuery}
                  onChangeText={(text) => setFilters({ ...filters, searchQuery: text })}
                />
              </View>
            </View>

            {/* Filter Options */}
            <View style={styles.filterContainer}>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowFilterModal(true)}
              >
                <ThemedText style={styles.filterButtonText}>
                  {filters.brands.length > 0 ? `${filters.brands.length} Brands` : 'All Brands'}
                </ThemedText>
                <IconSymbol name="chevron.right" size={16} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowFilterModal(true)}
              >
                <ThemedText style={styles.filterButtonText}>
                  ₦{filters.priceRange.min.toLocaleString()} - ₦{filters.priceRange.max.toLocaleString()}
                </ThemedText>
                <IconSymbol name="chevron.right" size={16} color={iconColor} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowFilterModal(true)}
              >
                <ThemedText style={styles.filterButtonText}>
                  {filters.sortBy === 'price-low' ? 'Price: Low to High' :
                   filters.sortBy === 'price-high' ? 'Price: High to Low' :
                   filters.sortBy === 'newest' ? 'Newest First' : 'Most Popular'}
                </ThemedText>
                <IconSymbol name="chevron.right" size={16} color={iconColor} />
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCategoryContainer}>
            <ThemedText style={styles.emptyCategoryIcon}>🛍️</ThemedText>
            <ThemedText type="subtitle" style={styles.emptyCategoryTitle}>
              No Items Found
            </ThemedText>
            <ThemedText style={styles.emptyCategoryDescription}>
              Try adjusting your filters or search terms to find what you're looking for.
            </ThemedText>
          </View>
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        availableBrands={availableBrands}
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '500',
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
    height: 200,
    resizeMode: 'cover',
  },
  boutiqueLogo: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'white',
    padding: 2,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemDetails: {
    padding: 12,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  wishlistButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tryOnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  tryOnButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyCategoryContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
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
  // Filter Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalApplyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filterOptionText: {
    fontSize: 16,
  },
  priceRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  priceRangeText: {
    fontSize: 16,
    opacity: 0.7,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  resetButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
