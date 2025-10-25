import type React from 'react';
import { ScrollView, StyleSheet, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { router } from 'expo-router';

// Mock data structure based on blueprint Item model
interface WardrobeItem {
  id: string;
  title: string;
  category: string;
  price?: number;
  imageUrl: string;
  colors: string[];
  tags: string[];
}

// Mock wardrobe data - comprehensive personal wardrobe items
const mockWardrobeData: WardrobeItem[] = [
  // TOPS
  {
    id: '1',
    title: 'White Cotton T-Shirt',
    category: 'top',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
    colors: ['white'],
    tags: ['casual', 'basic']
  },
  {
    id: '2',
    title: 'Black Hoodie',
    category: 'top',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a8?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['casual', 'street']
  },
  {
    id: '3',
    title: 'Navy Blouse',
    category: 'top',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    colors: ['navy'],
    tags: ['formal', 'work']
  },
  
  // BOTTOMS
  {
    id: '4',
    title: 'Dark Jeans',
    category: 'bottom',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&h=400&fit=crop',
    colors: ['blue'],
    tags: ['casual', 'denim']
  },
  {
    id: '5',
    title: 'Navy Sweatpants',
    category: 'bottom',
    imageUrl: 'https://images.unsplash.com/photo-1506629905607-3a4b4b4b4b4b?w=300&h=400&fit=crop',
    colors: ['navy'],
    tags: ['casual', 'athletic']
  },
  {
    id: '6',
    title: 'Black Trousers',
    category: 'bottom',
    imageUrl: 'https://images.unsplash.com/photo-1591195853828-9db59c24745a?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['formal', 'work']
  },
  
  // OUTERWEAR
  {
    id: '7',
    title: 'Blue Denim Jacket',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=400&fit=crop',
    colors: ['blue'],
    tags: ['casual', 'denim']
  },
  {
    id: '8',
    title: 'Black Leather Jacket',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['casual', 'leather']
  },
  
  // SHOES
  {
    id: '9',
    title: 'White Sneakers',
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
    colors: ['white'],
    tags: ['casual', 'athletic']
  },
  {
    id: '10',
    title: 'Black Dress Shoes',
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['formal', 'work']
  },
  {
    id: '11',
    title: 'Brown Boots',
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop',
    colors: ['brown'],
    tags: ['casual', 'boots']
  },
  
  // DRESSES
  {
    id: '12',
    title: 'Black Little Dress',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['formal', 'elegant']
  },
  {
    id: '13',
    title: 'Floral Summer Dress',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
    colors: ['multi'],
    tags: ['casual', 'summer']
  },
  
  // ACCESSORIES
  {
    id: '14',
    title: 'Black Handbag',
    category: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['bag', 'casual']
  },
  {
    id: '15',
    title: 'Gold Watch',
    category: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5b88c7c4c38?w=300&h=400&fit=crop',
    colors: ['gold'],
    tags: ['watch', 'luxury']
  },
  {
    id: '16',
    title: 'Silver Necklace',
    category: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=400&fit=crop',
    colors: ['silver'],
    tags: ['jewelry', 'elegant']
  },
  
  // UNDERWEAR/LINGERIE
  {
    id: '17',
    title: 'White Cotton Bra',
    category: 'underwear',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    colors: ['white'],
    tags: ['basic', 'comfortable']
  },
  {
    id: '18',
    title: 'Black Lace Set',
    category: 'underwear',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['lace', 'elegant']
  }
];

// Empty wardrobe for new users - uncomment above to see populated wardrobe
// const mockWardrobeData: WardrobeItem[] = [];

// Wardrobe Item Card Component - displays personal wardrobe items
const WardrobeItemCard: React.FC<{ item: WardrobeItem }> = ({ item }) => {
  const backgroundColor = useThemeColor({}, 'background');
  
  return (
    <TouchableOpacity style={[styles.itemCard, { backgroundColor }]}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <ThemedText style={styles.itemTitle} numberOfLines={2}>
        {item.title}
      </ThemedText>
    </TouchableOpacity>
  );
};

// Wardrobe Carousel Component - horizontal scrollable section
const WardrobeCarousel: React.FC<{ 
  title: string; 
  items: WardrobeItem[]; 
  onViewAll?: () => void 
}> = ({ title, items, onViewAll }) => {
  return (
    <View style={styles.carouselSection}>
      <View style={styles.carouselHeader}>
        <ThemedText type="subtitle" style={styles.carouselTitle}>
          {title}
        </ThemedText>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <ThemedText style={styles.viewAllText}>View All</ThemedText>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContent}
        renderItem={({ item }) => <WardrobeItemCard item={item} />}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

// Featured Wardrobe Item Section - large display for highlighted item
const FeaturedWardrobeItem: React.FC<{ item: WardrobeItem }> = ({ item }) => {
  return (
    <View style={styles.featuredSection}>
      <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} />
      <View style={styles.featuredContent}>
        <ThemedText type="subtitle" style={styles.featuredTitle}>
          {item.title}
        </ThemedText>
        <TouchableOpacity style={styles.featuredButton}>
          <ThemedText style={styles.featuredButtonText}>
            Try This Look
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Empty Wardrobe State Component - shown when user has no items
const EmptyWardrobeState: React.FC<{ onAddItem: () => void }> = ({ onAddItem }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');
  
  return (
    <View style={[styles.emptyStateContainer, { backgroundColor }]}>
      <View style={styles.emptyStateContent}>
        {/* Empty State Icon */}
        <View style={[styles.emptyStateIcon, { backgroundColor: iconColor + '20' }]}>
          <ThemedText style={[styles.emptyStateIconText, { color: iconColor }]}>
            👕
          </ThemedText>
        </View>
        
        {/* Empty State Title */}
        <ThemedText type="title" style={styles.emptyStateTitle}>
          Your Wardrobe Awaits
        </ThemedText>
        
        {/* Empty State Description */}
        <ThemedText style={styles.emptyStateDescription}>
          Start building your digital wardrobe by adding your favorite pieces. 
          Take photos of your clothes and let AI help you create amazing outfits!
        </ThemedText>
        
        {/* Add Item Button */}
        <TouchableOpacity style={styles.addItemButton} onPress={onAddItem}>
          <ThemedText style={styles.addItemButtonText}>
            + Add Your First Item
          </ThemedText>
        </TouchableOpacity>
        
        {/* Quick Tips */}
        <View style={styles.tipsContainer}>
          <ThemedText style={styles.tipsTitle}>💡 Quick Tips:</ThemedText>
          <ThemedText style={styles.tipText}>• Take photos against plain backgrounds</ThemedText>
          <ThemedText style={styles.tipText}>• Include full items in frame</ThemedText>
          <ThemedText style={styles.tipText}>• Good lighting works best</ThemedText>
        </View>
      </View>
    </View>
  );
};

export default function WardrobeScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  
  // Filter items by category for different sections
  const topsItems = mockWardrobeData.filter(item => item.category === 'top');
  const bottomsItems = mockWardrobeData.filter(item => item.category === 'bottom');
  const outerwearItems = mockWardrobeData.filter(item => item.category === 'outerwear');
  const shoesItems = mockWardrobeData.filter(item => item.category === 'shoes');
  const dressesItems = mockWardrobeData.filter(item => item.category === 'dress');
  const accessoriesItems = mockWardrobeData.filter(item => item.category === 'accessories');
  const underwearItems = mockWardrobeData.filter(item => item.category === 'underwear');
  
  // Featured item (first outerwear item)
  const featuredItem = outerwearItems[0];

  // Mock notification count - in real app this would come from state/API
  const notificationCount = 3;

  // Handler functions for header actions
  const handleSearchPress = () => {
    console.log('Search pressed - implement search functionality');
    // TODO: Navigate to search screen or show search modal
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed - implement notification screen');
    // TODO: Navigate to notifications screen
  };

  // Handler for adding new items
  const handleAddItem = () => {
    console.log('Add item pressed - implement add item functionality');
    // TODO: Navigate to camera or photo picker
  };

  // Handler for navigating to category view
  const handleViewAll = (category: string) => {
    router.push(`/category?category=${category}`);
  };

  // Check if wardrobe is empty
  const isWardrobeEmpty = mockWardrobeData.length === 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Custom Header */}
      <CustomHeader
        title="Wardrobe"
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        notificationCount={notificationCount}
      />

      <ScrollView style={styles.scrollContainer}>
        {isWardrobeEmpty ? (
          /* Empty Wardrobe State */
          <EmptyWardrobeState onAddItem={handleAddItem} />
        ) : (
          /* Populated Wardrobe */
          <>
            {/* Featured Wardrobe Item Section */}
            {featuredItem && (
              <FeaturedWardrobeItem item={featuredItem} />
            )}

            {/* Tops Section */}
            <WardrobeCarousel 
              title="Tops" 
              items={topsItems}
              onViewAll={() => handleViewAll('top')}
            />

            {/* Bottoms Section */}
            <WardrobeCarousel 
              title="Bottoms" 
              items={bottomsItems}
              onViewAll={() => handleViewAll('bottom')}
            />

            {/* Dresses Section */}
            {dressesItems.length > 0 && (
              <WardrobeCarousel 
                title="Dresses" 
                items={dressesItems}
                onViewAll={() => handleViewAll('dress')}
              />
            )}

            {/* Outerwear Section */}
            <WardrobeCarousel 
              title="Outerwear" 
              items={outerwearItems}
              onViewAll={() => handleViewAll('outerwear')}
            />

            {/* Shoes Section */}
            <WardrobeCarousel 
              title="Shoes" 
              items={shoesItems}
              onViewAll={() => handleViewAll('shoes')}
            />

            {/* Accessories Section */}
            <WardrobeCarousel 
              title="Accessories" 
              items={accessoriesItems}
              onViewAll={() => handleViewAll('accessories')}
            />

            {/* Underwear Section */}
            {underwearItems.length > 0 && (
              <WardrobeCarousel 
                title="Underwear" 
                items={underwearItems}
                onViewAll={() => handleViewAll('underwear')}
              />
            )}

            {/* Recently Added Section */}
            <WardrobeCarousel 
              title="Recently Added" 
              items={mockWardrobeData.slice(0, 4)}
              onViewAll={() => handleViewAll('recent')}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  featuredSection: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 12,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  featuredContent: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  featuredTitle: {
    color: 'white',
    marginBottom: 15,
  },
  featuredButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  featuredButtonText: {
    color: 'black',
    fontWeight: '600',
  },
  carouselSection: {
    marginBottom: 30,
  },
  carouselHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  viewAllText: {
    color: '#0a7ea4',
    fontSize: 16,
  },
  carouselContent: {
    paddingHorizontal: 20,
  },
  itemCard: {
    width: 150,
    marginRight: 15,
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
  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateIconText: {
    fontSize: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  addItemButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 32,
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
  tipsContainer: {
    alignSelf: 'stretch',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
    opacity: 0.8,
  },
});
