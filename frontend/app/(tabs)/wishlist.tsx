import type React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useWishlist } from '@/contexts/WishlistContext';
import { router } from 'expo-router';

// Boutique item interface (same as in other files)
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

// Wishlist Item Card Component
const WishlistItemCard: React.FC<{ item: BoutiqueItem }> = ({ item }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const { removeFromWishlist } = useWishlist();
  
  const handleRemove = () => {
    Alert.alert(
      'Remove from Wishlist',
      `Remove "${item.title}" from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeFromWishlist(item.id)
        }
      ]
    );
  };

  const handleViewDetails = () => {
    console.log(`View details for ${item.title}`);
    // TODO: Navigate to product details
  };

  const handleTryOn = () => {
    console.log(`Try virtually ${item.title}`);
    router.push(`/virtual-tryon?itemId=${item.id}`);
  };

  return (
    <TouchableOpacity style={[styles.itemCard, { backgroundColor }]} onPress={handleViewDetails}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      
      {/* Boutique Logo */}
      <View style={styles.boutiqueLogo}>
        <Image source={{ uri: item.boutique.logo }} style={styles.logoImage} />
      </View>

      {/* AR/AI Try-On Badge */}
      {item.arAvailable && (
        <View style={[styles.arBadge, { backgroundColor: tintColor }]}>
          <IconSymbol name="plus" size={12} color="white" />
          <ThemedText style={styles.arBadgeText}>AR</ThemedText>
        </View>
      )}

      {/* Remove from Wishlist Button */}
      <TouchableOpacity 
        style={[
          styles.removeButton, 
          item.arAvailable && styles.removeButtonWithAR
        ]} 
        onPress={handleRemove}
      >
        <IconSymbol name="plus" size={16} color="white" style={{ transform: [{ rotate: '45deg' }] }} />
      </TouchableOpacity>

      <View style={styles.itemDetails}>
        <ThemedText style={styles.brandName}>{item.brand}</ThemedText>
        <ThemedText style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.price}>₦{item.price.toLocaleString()}</ThemedText>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.tryOnButton, { backgroundColor: tintColor }]} 
            onPress={handleTryOn}
          >
            <IconSymbol name="plus" size={14} color="white" />
            <ThemedText style={styles.tryOnButtonText}>
              Try Virtually
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.buyButton}
            onPress={() => console.log('Add to cart')}
          >
            <ThemedText style={styles.buyButtonText}>Buy Now</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Empty Wishlist Component
const EmptyWishlist: React.FC = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const handleShopNow = () => {
    router.push('/(tabs)/explore');
  };

  return (
    <View style={[styles.emptyContainer, { backgroundColor }]}>
      <View style={styles.emptyContent}>
        <View style={[styles.emptyIcon, { backgroundColor: tintColor + '20' }]}>
          <ThemedText style={styles.emptyIconText}>💝</ThemedText>
        </View>
        <ThemedText type="title" style={styles.emptyTitle}>
          Your Wishlist is Empty
        </ThemedText>
        <ThemedText style={styles.emptyDescription}>
          Start exploring our boutique collections and save your favorite items for later.
        </ThemedText>
        <TouchableOpacity style={[styles.shopButton, { backgroundColor: tintColor }]} onPress={handleShopNow}>
          <ThemedText style={styles.shopButtonText}>Start Shopping</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Wishlist Screen Component
 * Displays user's saved wishlist items with options to try-on, buy, or remove
 */
export default function WishlistScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const { wishlistItems, clearWishlist } = useWishlist();

  const handleSearchPress = () => {
    console.log('Search pressed - implement search functionality');
    // TODO: Navigate to search screen
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed - implement notification screen');
    // TODO: Navigate to notifications screen
  };

  const handleClearWishlist = () => {
    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to remove all items from your wishlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: clearWishlist
        }
      ]
    );
  };

  if (wishlistItems.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader
          title="Wishlist"
          onSearchPress={handleSearchPress}
          onNotificationPress={handleNotificationPress}
          notificationCount={0}
        />
        <EmptyWishlist />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Wishlist"
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        notificationCount={0}
      />

      <FlatList
        data={wishlistItems}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WishlistItemCard item={item} />}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <ThemedText style={styles.itemCount}>
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
            </ThemedText>
            <TouchableOpacity onPress={handleClearWishlist}>
              <ThemedText style={styles.clearText}>Clear All</ThemedText>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  itemCount: {
    fontSize: 16,
    opacity: 0.7,
  },
  clearText: {
    fontSize: 16,
    color: '#ff4444',
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
  arBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  arBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonWithAR: {
    top: 50, // Move down when AR badge is present
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
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  tryOnButton: {
    flex: 1,
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
  buyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
  },
  buyButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyContent: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIconText: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  shopButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
