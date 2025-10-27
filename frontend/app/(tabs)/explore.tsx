import type React from 'react';
import { ScrollView, StyleSheet, View, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

// Boutique item interface based on blueprint
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

// Mock boutique data
const mockBoutiqueData: BoutiqueItem[] = [
  {
    id: '1',
    title: 'Designer Blazer',
    brand: 'Fashion Forward',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=300&h=400&fit=crop',
    price: 45000,
    colors: ['navy', 'black'],
    tags: ['formal', 'business'],
    boutique: {
      id: 'b1',
      name: 'Luxe Boutique',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '2',
    title: 'Silk Evening Dress',
    brand: 'Elegance Co',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
    price: 85000,
    colors: ['black', 'emerald'],
    tags: ['formal', 'evening'],
    boutique: {
      id: 'b2',
      name: 'Chic Collection',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '3',
    title: 'Casual Denim Jacket',
    brand: 'Urban Style',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=400&fit=crop',
    price: 25000,
    colors: ['blue', 'black'],
    tags: ['casual', 'denim'],
    boutique: {
      id: 'b3',
      name: 'Street Fashion',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: false
  },
  {
    id: '4',
    title: 'Premium Sneakers',
    brand: 'Athletic Pro',
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
    price: 35000,
    colors: ['white', 'black'],
    tags: ['casual', 'athletic'],
    boutique: {
      id: 'b4',
      name: 'Sport Hub',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '5',
    title: 'Luxury Handbag',
    brand: 'Premium Leather',
    category: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
    price: 120000,
    colors: ['brown', 'black'],
    tags: ['luxury', 'leather'],
    boutique: {
      id: 'b5',
      name: 'Elite Accessories',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '6',
    title: 'Summer Maxi Dress',
    brand: 'Boho Chic',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
    price: 32000,
    colors: ['floral', 'white'],
    tags: ['casual', 'summer'],
    boutique: {
      id: 'b6',
      name: 'Bohemian Dreams',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: false
  }
];

// Boutique Item Card Component
const BoutiqueItemCard: React.FC<{ item: BoutiqueItem }> = ({ item }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  const handleTryOn = () => {
    console.log(`Try virtually ${item.title}`);
    router.push(`/virtual-tryon?itemId=${item.id}`);
  };

  const handleViewDetails = () => {
    console.log(`View details for ${item.title}`);
    // TODO: Navigate to product details
  };

  return (
    <TouchableOpacity style={[styles.itemCard, { backgroundColor }]} onPress={handleViewDetails}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      
      {/* Boutique Logo */}
      <View style={styles.boutiqueLogo}>
        <Image source={{ uri: item.boutique.logo }} style={styles.logoImage} />
      </View>

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

// Featured Boutique Section
const FeaturedBoutique: React.FC<{ item: BoutiqueItem }> = ({ item }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <TouchableOpacity style={[styles.featuredCard, { backgroundColor }]}>
      <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} />
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredContent}>
          <ThemedText style={styles.featuredTitle}>Featured Boutique</ThemedText>
          <ThemedText style={styles.featuredBoutique}>{item.boutique.name}</ThemedText>
          <ThemedText style={styles.featuredItem}>{item.title}</ThemedText>
          <TouchableOpacity style={[styles.featuredButton, { backgroundColor: tintColor }]}>
            <ThemedText style={styles.featuredButtonText}>Explore Collection</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Search and Filter Component
const SearchAndFilter: React.FC = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View style={[styles.searchContainer, { backgroundColor }]}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <IconSymbol name="magnifyingglass" size={20} color={iconColor} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search boutiques, brands, styles..."
          placeholderTextColor={iconColor}
        />
      </View>
      
      {/* Filter Buttons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity style={styles.filterButton}>
          <ThemedText style={styles.filterButtonText}>All</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <ThemedText style={styles.filterButtonText}>Dresses</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <ThemedText style={styles.filterButtonText}>Outerwear</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <ThemedText style={styles.filterButtonText}>Shoes</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <ThemedText style={styles.filterButtonText}>Accessories</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

/**
 * Shop Screen Component
 * Dedicated space for users to browse boutique collections and try items in AR/AI
 * Based on blueprint requirements for boutique discovery and try-on functionality
 */
export default function ShopScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  
  // Filter items by category for different sections
  const featuredItem = mockBoutiqueData[0];
  const dressesItems = mockBoutiqueData.filter(item => item.category === 'dress');
  const outerwearItems = mockBoutiqueData.filter(item => item.category === 'outerwear');
  const shoesItems = mockBoutiqueData.filter(item => item.category === 'shoes');
  const accessoriesItems = mockBoutiqueData.filter(item => item.category === 'accessories');

  // Handler functions for header actions
  const handleSearchPress = () => {
    console.log('Search pressed - implement search functionality');
    // TODO: Navigate to advanced search screen
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed - implement notification screen');
    // TODO: Navigate to notifications screen
  };

  // Handler for navigating to shop category view
  const handleViewAll = (category: string) => {
    router.push(`/shop-category?category=${category}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Custom Header */}
      <CustomHeader
        title="Shop"
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        notificationCount={2}
      />

      <ScrollView style={styles.scrollContainer}>
        {/* Search and Filter Section */}
        <SearchAndFilter />

        {/* Featured Boutique */}
        <FeaturedBoutique item={featuredItem} />

        {/* Shop by Look Section */}
        <View style={styles.sectionHeader}>
          <ThemedText type="title" style={styles.sectionTitle}>Shop by Look</ThemedText>
          <TouchableOpacity onPress={() => handleViewAll('all')}>
            <ThemedText style={styles.viewAllText}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Dresses Section */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.categoryTitle}>Dresses</ThemedText>
          <TouchableOpacity onPress={() => handleViewAll('dress')}>
            <ThemedText style={styles.viewAllText}>View All</ThemedText>
          </TouchableOpacity>
        </View>
        <FlatList
          data={dressesItems}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BoutiqueItemCard item={item} />}
          contentContainerStyle={styles.horizontalList}
          showsHorizontalScrollIndicator={false}
        />

        {/* Outerwear Section */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.categoryTitle}>Outerwear</ThemedText>
          <TouchableOpacity onPress={() => handleViewAll('outerwear')}>
            <ThemedText style={styles.viewAllText}>View All</ThemedText>
          </TouchableOpacity>
        </View>
        <FlatList
          data={outerwearItems}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BoutiqueItemCard item={item} />}
          contentContainerStyle={styles.horizontalList}
          showsHorizontalScrollIndicator={false}
        />

        {/* Shoes Section */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.categoryTitle}>Shoes</ThemedText>
          <TouchableOpacity onPress={() => handleViewAll('shoes')}>
            <ThemedText style={styles.viewAllText}>View All</ThemedText>
          </TouchableOpacity>
        </View>
        <FlatList
          data={shoesItems}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BoutiqueItemCard item={item} />}
          contentContainerStyle={styles.horizontalList}
          showsHorizontalScrollIndicator={false}
        />

        {/* Accessories Section */}
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.categoryTitle}>Accessories</ThemedText>
          <TouchableOpacity onPress={() => handleViewAll('accessories')}>
            <ThemedText style={styles.viewAllText}>View All</ThemedText>
          </TouchableOpacity>
        </View>
        <FlatList
          data={accessoriesItems}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BoutiqueItemCard item={item} />}
          contentContainerStyle={styles.horizontalList}
          showsHorizontalScrollIndicator={false}
        />
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterScroll: {
    marginHorizontal: -20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  featuredCard: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  featuredImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  featuredContent: {
    alignItems: 'center',
  },
  featuredTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuredBoutique: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  featuredItem: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 2,
  },
  featuredButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 12,
  },
  featuredButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  horizontalList: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  itemCard: {
    width: 180,
    marginRight: 16,
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
});