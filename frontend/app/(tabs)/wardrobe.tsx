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
    tags: ['casual', 'comfortable']
  },
  {
    id: '6',
    title: 'Black Dress Pants',
    category: 'bottom',
    imageUrl: 'https://images.unsplash.com/photo-1506629905607-3a4b4b4b4b4b?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['formal', 'work']
  },
  
  // SHOES
  {
    id: '7',
    title: 'White Sneakers',
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
    colors: ['white'],
    tags: ['casual', 'athletic']
  },
  {
    id: '8',
    title: 'Black Dress Shoes',
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['formal', 'leather']
  },
  {
    id: '9',
    title: 'Brown Boots',
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=400&fit=crop',
    colors: ['brown'],
    tags: ['casual', 'boots']
  },
  
  // OUTERWEAR
  {
    id: '10',
    title: 'Blue Denim Jacket',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=400&fit=crop',
    colors: ['blue'],
    tags: ['casual', 'denim']
  },
  {
    id: '11',
    title: 'Black Blazer',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['formal', 'work']
  },
  {
    id: '12',
    title: 'Gray Cardigan',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=400&fit=crop',
    colors: ['gray'],
    tags: ['casual', 'comfortable']
  },
  
  // DRESSES
  {
    id: '13',
    title: 'Black Little Dress',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['formal', 'elegant']
  },
  {
    id: '14',
    title: 'Floral Summer Dress',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
    colors: ['floral'],
    tags: ['casual', 'summer']
  },
  {
    id: '15',
    title: 'Red Cocktail Dress',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
    colors: ['red'],
    tags: ['formal', 'party']
  },
  
  // ACCESSORIES
  {
    id: '16',
    title: 'Black Leather Handbag',
    category: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['leather', 'elegant']
  },
  {
    id: '17',
    title: 'Gold Statement Necklace',
    category: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=400&fit=crop',
    colors: ['gold'],
    tags: ['jewelry', 'statement']
  },
  {
    id: '18',
    title: 'Silk Scarf',
    category: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=400&fit=crop',
    colors: ['multicolor'],
    tags: ['silk', 'elegant']
  },
  
  // UNDERWEAR
  {
    id: '19',
    title: 'Cotton Bra Set',
    category: 'underwear',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    colors: ['white'],
    tags: ['cotton', 'comfortable']
  },
  {
    id: '20',
    title: 'Black Lace Set',
    category: 'underwear',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['lace', 'elegant']
  }
];


// Wardrobe Item Card Component - displays personal wardrobe items
const WardrobeItemCard: React.FC<{ item: WardrobeItem }> = ({ item }) => {
  const backgroundColor = useThemeColor({}, 'background');
  
  return (
    <TouchableOpacity style={[styles.itemCard, { backgroundColor }]}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
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
  items: WardrobeItem[]; 
  onViewAll?: () => void;
}> = ({ title, items, onViewAll }) => {
  const tintColor = useThemeColor({}, 'tint');
  
  return (
    <View style={styles.carouselContainer}>
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
          <WardrobeItemCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
};

// Featured Wardrobe Item Component - larger display for featured items
const FeaturedWardrobeItem: React.FC<{ item: WardrobeItem }> = ({ item }) => {
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
          {item.tags.map((tag) => (
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
    console.log('Add first item pressed');
    // TODO: Navigate to add item screen or camera
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
  
  // Filter items by category
  const topItems = mockWardrobeData.filter(item => item.category === 'top');
  const bottomItems = mockWardrobeData.filter(item => item.category === 'bottom');
  const shoeItems = mockWardrobeData.filter(item => item.category === 'shoes');
  const outerwearItems = mockWardrobeData.filter(item => item.category === 'outerwear');
  const dressItems = mockWardrobeData.filter(item => item.category === 'dress');
  const accessoryItems = mockWardrobeData.filter(item => item.category === 'accessories');
  const underwearItems = mockWardrobeData.filter(item => item.category === 'underwear');
  
  // Featured item (first outerwear item)
  const featuredItem = outerwearItems[0];

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

  // Show empty state if no items
  if (mockWardrobeData.length === 0) {
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
        {featuredItem && (
          <View style={styles.featuredSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Featured</ThemedText>
            <FeaturedWardrobeItem item={featuredItem} />
          </View>
        )}

        {/* Recently Added */}
        <WardrobeCarousel
          title="Recently Added"
          items={mockWardrobeData.slice(0, 4)}
          onViewAll={() => handleViewAll('recent')}
        />

        {/* Tops */}
        {topItems.length > 0 && (
          <WardrobeCarousel
            title="Tops"
            items={topItems}
            onViewAll={() => handleViewAll('top')}
          />
        )}

        {/* Bottoms */}
        {bottomItems.length > 0 && (
          <WardrobeCarousel
            title="Bottoms"
            items={bottomItems}
            onViewAll={() => handleViewAll('bottom')}
          />
        )}

        {/* Shoes */}
        {shoeItems.length > 0 && (
          <WardrobeCarousel
            title="Shoes"
            items={shoeItems}
            onViewAll={() => handleViewAll('shoes')}
          />
        )}

        {/* Outerwear */}
        {outerwearItems.length > 0 && (
          <WardrobeCarousel
            title="Outerwear"
            items={outerwearItems}
            onViewAll={() => handleViewAll('outerwear')}
          />
        )}

        {/* Dresses */}
        {dressItems.length > 0 && (
          <WardrobeCarousel
            title="Dresses"
            items={dressItems}
            onViewAll={() => handleViewAll('dress')}
          />
        )}

        {/* Accessories */}
        {accessoryItems.length > 0 && (
          <WardrobeCarousel
            title="Accessories"
            items={accessoryItems}
            onViewAll={() => handleViewAll('accessories')}
          />
        )}

        {/* Underwear */}
        {underwearItems.length > 0 && (
          <WardrobeCarousel
            title="Underwear"
            items={underwearItems}
            onViewAll={() => handleViewAll('underwear')}
          />
        )}
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
});