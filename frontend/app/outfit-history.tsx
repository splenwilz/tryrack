import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

// Outfit History interface
interface OutfitHistory {
  id: string;
  date: string;
  items: string[];
  imageUrl: string;
  occasion: string;
  rating: number;
  weather?: string;
  notes?: string;
  tags: string[];
  isFavorite: boolean;
}

// Extended mock data for comprehensive outfit history
const mockOutfitHistory: OutfitHistory[] = [
  {
    id: '1',
    date: '2024-01-15',
    items: ['Black Blazer', 'White Shirt', 'Dark Jeans', 'Black Dress Shoes'],
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=200&h=200&fit=crop',
    occasion: 'Work Meeting',
    rating: 4.5,
    weather: '22°C, Sunny',
    notes: 'Perfect for the client presentation. Received compliments on the blazer.',
    tags: ['professional', 'formal', 'confident'],
    isFavorite: true
  },
  {
    id: '2',
    date: '2024-01-14',
    items: ['Navy Dress', 'Black Heels', 'Gold Necklace', 'Black Handbag'],
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop',
    occasion: 'Date Night',
    rating: 5.0,
    weather: '18°C, Evening',
    notes: 'Absolutely loved this look! The dress fit perfectly and the accessories complemented it well.',
    tags: ['elegant', 'romantic', 'sophisticated'],
    isFavorite: true
  },
  {
    id: '3',
    date: '2024-01-13',
    items: ['White T-Shirt', 'Blue Jeans', 'White Sneakers', 'Denim Jacket'],
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop',
    occasion: 'Casual Weekend',
    rating: 4.0,
    weather: '25°C, Partly Cloudy',
    notes: 'Comfortable and stylish for running errands and meeting friends.',
    tags: ['casual', 'comfortable', 'versatile'],
    isFavorite: false
  },
  {
    id: '4',
    date: '2024-01-12',
    items: ['Gray Cardigan', 'Black Pants', 'White Sneakers', 'Silver Watch'],
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200&h=200&fit=crop',
    occasion: 'Coffee Meeting',
    rating: 4.2,
    weather: '20°C, Overcast',
    notes: 'Great for a casual business meeting. The cardigan added warmth and style.',
    tags: ['smart-casual', 'comfortable', 'professional'],
    isFavorite: false
  },
  {
    id: '5',
    date: '2024-01-11',
    items: ['Red Cocktail Dress', 'Black Heels', 'Gold Earrings', 'Clutch Bag'],
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop',
    occasion: 'Party',
    rating: 4.8,
    weather: '19°C, Evening',
    notes: 'Stunning look for the party! The red dress was a showstopper.',
    tags: ['party', 'bold', 'glamorous'],
    isFavorite: true
  },
  {
    id: '6',
    date: '2024-01-10',
    items: ['Black Hoodie', 'Navy Sweatpants', 'White Sneakers', 'Baseball Cap'],
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a8?w=200&h=200&fit=crop',
    occasion: 'Gym',
    rating: 3.5,
    weather: '23°C, Sunny',
    notes: 'Perfect for workout session. Comfortable and functional.',
    tags: ['athletic', 'comfortable', 'functional'],
    isFavorite: false
  }
];

// Outfit History Card Component
const OutfitHistoryCard: React.FC<{ outfit: OutfitHistory }> = ({ outfit }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  
  const handleViewDetails = () => {
    console.log(`View details for outfit: ${outfit.id}`);
    // TODO: Navigate to outfit details screen
  };

  const handleToggleFavorite = () => {
    console.log(`Toggle favorite for outfit: ${outfit.id}`);
    // TODO: Implement favorite toggle
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(outfit.rating);
    const hasHalfStar = outfit.rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <IconSymbol key={i} name="star.fill" size={12} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <IconSymbol key="half" name="star.leadinghalf.filled" size={12} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(outfit.rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <IconSymbol key={`empty-${i}`} name="star" size={12} color="#E0E0E0" />
      );
    }

    return stars;
  };

  return (
    <TouchableOpacity style={[styles.outfitCard, { backgroundColor }]} onPress={handleViewDetails}>
      <Image source={{ uri: outfit.imageUrl }} style={styles.outfitImage} />
      
      {/* Favorite Button */}
      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={handleToggleFavorite}
      >
        <IconSymbol 
          name={outfit.isFavorite ? "heart.fill" : "heart"} 
          size={16} 
          color={outfit.isFavorite ? "#FF3B30" : "rgba(255,255,255,0.8)"} 
        />
      </TouchableOpacity>

      <View style={styles.outfitInfo}>
        <View style={styles.outfitHeader}>
          <ThemedText style={styles.outfitDate}>{outfit.date}</ThemedText>
          <View style={styles.ratingContainer}>
            {renderStars()}
            <ThemedText style={styles.ratingText}>{outfit.rating}</ThemedText>
          </View>
        </View>

        <ThemedText style={[styles.outfitOccasion, { color: tintColor }]}>
          {outfit.occasion}
        </ThemedText>

        {outfit.weather && (
          <View style={styles.weatherContainer}>
            <IconSymbol name="cloud.sun" size={12} color={iconColor} />
            <ThemedText style={[styles.weatherText, { color: iconColor }]}>
              {outfit.weather}
            </ThemedText>
          </View>
        )}

        <View style={styles.itemsContainer}>
          <ThemedText style={styles.itemsTitle}>Items:</ThemedText>
          <ThemedText style={[styles.itemsText, { color: iconColor }]} numberOfLines={2}>
            {outfit.items.join(', ')}
          </ThemedText>
        </View>

        {outfit.notes && (
          <ThemedText style={[styles.outfitNotes, { color: iconColor }]} numberOfLines={2}>
            "{outfit.notes}"
          </ThemedText>
        )}

        <View style={styles.tagsContainer}>
        {outfit.tags.map((tag) => (
          <View key={tag} style={[styles.tag, { backgroundColor: tintColor }]}>
            <ThemedText style={styles.tagText}>{tag}</ThemedText>
          </View>
        ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Filter Component
const OutfitFilter: React.FC<{ 
  selectedFilter: string; 
  onFilterChange: (filter: string) => void;
}> = ({ selectedFilter, onFilterChange }) => {
  const tintColor = useThemeColor({}, 'tint');
  
  const filters = [
    { id: 'all', name: 'All Outfits' },
    { id: 'favorites', name: 'Favorites' },
    { id: 'work', name: 'Work' },
    { id: 'casual', name: 'Casual' },
    { id: 'party', name: 'Party' },
    { id: 'recent', name: 'Recent' }
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScroll}
    >
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          style={[
            styles.filterButton,
            { 
              backgroundColor: selectedFilter === filter.id ? tintColor : 'transparent',
              borderColor: tintColor
            }
          ]}
          onPress={() => onFilterChange(filter.id)}
        >
          <ThemedText 
            style={[
              styles.filterButtonText,
              { color: selectedFilter === filter.id ? 'white' : tintColor }
            ]}
          >
            {filter.name}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

// Empty State Component
const EmptyStateComponent: React.FC<{ iconColor: string }> = ({ iconColor }) => (
  <View style={styles.emptyState}>
    <IconSymbol name="tshirt" size={48} color={iconColor} />
    <ThemedText style={styles.emptyStateTitle}>No Outfits Found</ThemedText>
    <ThemedText style={styles.emptyStateDescription}>
      Try adjusting your filter or create some new outfit combinations.
    </ThemedText>
  </View>
);

/**
 * Outfit History Screen Component
 * Comprehensive view of all outfit combinations and history
 */
export default function OutfitHistoryScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const [selectedFilter, setSelectedFilter] = React.useState('all');
  
  const filteredOutfits = React.useMemo(() => {
    switch (selectedFilter) {
      case 'favorites':
        return mockOutfitHistory.filter(outfit => outfit.isFavorite);
      case 'work':
        return mockOutfitHistory.filter(outfit => 
          outfit.occasion.toLowerCase().includes('work') || 
          outfit.occasion.toLowerCase().includes('meeting')
        );
      case 'casual':
        return mockOutfitHistory.filter(outfit => 
          outfit.occasion.toLowerCase().includes('casual') ||
          outfit.occasion.toLowerCase().includes('weekend')
        );
      case 'party':
        return mockOutfitHistory.filter(outfit => 
          outfit.occasion.toLowerCase().includes('party') ||
          outfit.occasion.toLowerCase().includes('date')
        );
      case 'recent':
        return mockOutfitHistory.slice(0, 3);
      default:
        return mockOutfitHistory;
    }
  }, [selectedFilter]);

  const handleBackPress = () => {
    router.back();
  };

  const renderOutfitCard = ({ item }: { item: OutfitHistory }) => (
    <OutfitHistoryCard outfit={item} />
  );


  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Outfit History"
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <ThemedText type="title" style={styles.headerTitle}>
            Your Style Archive
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Track your outfit combinations, ratings, and style evolution over time.
          </ThemedText>
        </View>

        {/* Filter */}
        <OutfitFilter 
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        {/* Outfits List */}
        <FlatList
          data={filteredOutfits}
          renderItem={renderOutfitCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.outfitsList}
          ListEmptyComponent={() => <EmptyStateComponent iconColor={iconColor} />}
        />
      </View>
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
  headerSection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 24,
    maxWidth: 300,
  },
  filterScroll: {
    paddingVertical: 16,
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  outfitsList: {
    paddingVertical: 16,
  },
  outfitCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outfitImage: {
    width: '100%',
    height: 200,
  },
  favoriteButton: {
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
  outfitInfo: {
    padding: 16,
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  outfitDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  outfitOccasion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weatherText: {
    fontSize: 12,
    marginLeft: 4,
  },
  itemsContainer: {
    marginBottom: 8,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemsText: {
    fontSize: 12,
    lineHeight: 16,
  },
  outfitNotes: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    maxWidth: 250,
  },
});
