import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

// Product interface matching catalog
interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  sales: number;
  revenue: number;
  views: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  tags: string[];
  description: string;
  createdAt: string;
  lastUpdated: string;
  rating: number;
  reviews: number;
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Designer Blazer',
    category: 'outerwear',
    brand: 'Fashion Forward',
    price: 45000,
    originalPrice: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=400&h=400&fit=crop',
    sales: 45,
    revenue: 2025000,
    views: 1200,
    stock: 8,
    status: 'active',
    tags: ['formal', 'business', 'premium'],
    description: 'Elegant designer blazer perfect for business meetings and formal occasions. Made from high-quality fabric with a modern fit.',
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-15',
    rating: 4.8,
    reviews: 23
  },
  {
    id: '2',
    name: 'Silk Evening Dress',
    category: 'dress',
    brand: 'Elegance Co',
    price: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
    sales: 32,
    revenue: 2400000,
    views: 980,
    stock: 3,
    status: 'active',
    tags: ['elegant', 'formal', 'luxury'],
    description: 'Luxurious silk evening dress for special occasions and formal events. Features elegant draping and sophisticated design.',
    createdAt: '2024-01-02',
    lastUpdated: '2024-01-14',
    rating: 4.9,
    reviews: 18
  },
];

/**
 * Product Detail Screen
 * Comprehensive view of a single product with full actions and information
 */
export default function ProductDetailScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const { productId } = useLocalSearchParams();
  
  const product = mockProducts.find(p => p.id === productId);
  
  const handleBackPress = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/(boutique)/product-edit?productId=${productId}`);
  };

  const handleToggleStatus = () => {
    const newStatus = product?.status === 'active' ? 'inactive' : 'active';
    Alert.alert(
      'Change Status',
      `Change product status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => Alert.alert('Success', 'Status updated') }
      ]
    );
  };

  const handleDetails = () => {
    Alert.alert('Product Details', product?.description);
  };

  const handleTryVirtually = () => {
    const url = `/(boutique)/boutique-tryon?productId=${productId}`;
    // @ts-expect-error - Expo Router dynamic route typing
    router.push(url);
  };

  const handleDuplicate = () => {
    Alert.alert('Duplicate Product', `Create a copy of ${product?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Duplicate', onPress: () => Alert.alert('Success', 'Product duplicated') }
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Product deleted');
            router.back();
          }
        }
      ]
    );
  };

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="Product Details" showBackButton={true} onBackPress={handleBackPress} />
        <View style={styles.centerContent}>
          <ThemedText>Product not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const getStockColor = () => {
    if (product.stock === 0) return '#FF5722';
    if (product.stock <= 5) return '#FFA500';
    return '#4CAF50';
  };

  const getStockText = () => {
    if (product.stock === 0) return 'Out of Stock';
    return `${product.stock} left`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader title="Product Details" showBackButton={true} onBackPress={handleBackPress} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
          
          {/* Status Badge */}
          <View style={[styles.statusBadge, { 
            backgroundColor: product.status === 'active' ? '#4CAF50' : '#FFA500' 
          }]}>
            <ThemedText style={styles.statusText}>{product.status}</ThemedText>
          </View>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <View style={[styles.discountBadge, { backgroundColor: tintColor }]}>
              <ThemedText style={styles.discountText}>-{discountPercent}%</ThemedText>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={[styles.infoSection, { backgroundColor }]}>
          <ThemedText type="title" style={styles.productName}>{product.name}</ThemedText>
          <ThemedText style={[styles.brandName, { color: iconColor }]}>{product.brand}</ThemedText>
          
          {/* Price */}
          <View style={styles.priceContainer}>
            <ThemedText style={styles.currentPrice}>₦{product.price.toLocaleString()}</ThemedText>
            {product.originalPrice && (
              <ThemedText style={[styles.originalPrice, { color: iconColor }]}>
                ₦{product.originalPrice.toLocaleString()}
              </ThemedText>
            )}
          </View>

          {/* Description */}
          <ThemedText style={[styles.description, { color: iconColor }]}>
            {product.description}
          </ThemedText>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor }]}>
            <IconSymbol name="bag.fill" size={24} color={tintColor} />
            <ThemedText style={styles.statValue}>{product.sales}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: iconColor }]}>Sales</ThemedText>
          </View>
          
          <View style={[styles.statCard, { backgroundColor }]}>
            <IconSymbol name="dollarsign" size={24} color={tintColor} />
            <ThemedText style={styles.statValue}>₦{(product.revenue / 1000).toFixed(1)}k</ThemedText>
            <ThemedText style={[styles.statLabel, { color: iconColor }]}>Revenue</ThemedText>
          </View>
          
          <View style={[styles.statCard, { backgroundColor }]}>
            <IconSymbol name="eye.fill" size={24} color={tintColor} />
            <ThemedText style={styles.statValue}>{product.views}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: iconColor }]}>Views</ThemedText>
          </View>
          
          <View style={[styles.statCard, { backgroundColor }]}>
            <IconSymbol name="star.fill" size={24} color="#FFD700" />
            <ThemedText style={styles.statValue}>{product.rating}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: iconColor }]}>Rating</ThemedText>
          </View>
        </View>

        {/* Stock Info */}
        <View style={[styles.section, { backgroundColor }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Inventory</ThemedText>
            <ThemedText style={[styles.stockText, { color: getStockColor() }]}>
              {getStockText()}
            </ThemedText>
          </View>
          <ThemedText style={[styles.stockInfo, { color: iconColor }]}>
            <ThemedText style={[styles.stockLabel, { color: iconColor }]}>Category:</ThemedText> {product.category}
          </ThemedText>
          <ThemedText style={[styles.stockInfo, { color: iconColor }]}>
            <ThemedText style={[styles.stockLabel, { color: iconColor }]}>Last Updated:</ThemedText> {product.lastUpdated}
          </ThemedText>
        </View>

        {/* Tags */}
        {product.tags.length > 0 && (
          <View style={[styles.section, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Tags</ThemedText>
            <View style={styles.tagsContainer}>
              {product.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: tintColor }]}>
                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <View style={styles.primaryActions}>
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: tintColor }]}
              onPress={handleEdit}
            >
              <IconSymbol name="pencil" size={20} color="white" />
              <ThemedText style={styles.primaryButtonText}>Edit</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.primaryButton, { 
                backgroundColor: product.status === 'active' ? '#4CAF50' : '#FFA500' 
              }]}
              onPress={handleToggleStatus}
            >
              <IconSymbol name="lock" size={20} color="white" />
              <ThemedText style={styles.primaryButtonText}>
                {product.status === 'active' ? 'Deactivate' : 'Activate'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.tryOnButton, { backgroundColor: tintColor }]}
            onPress={handleTryVirtually}
          >
            <IconSymbol name="camera.fill" size={18} color="white" />
            <ThemedText style={styles.tryOnButtonText}>
              Try Virtually
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity 
              style={[styles.secondaryButton, { backgroundColor }]}
              onPress={handleDetails}
            >
              <IconSymbol name="info.circle" size={18} color={tintColor} />
              <ThemedText style={[styles.secondaryButtonText, { color: tintColor }]}>
                Details
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, { backgroundColor }]}
              onPress={handleDuplicate}
            >
              <IconSymbol name="plus" size={18} color={tintColor} />
              <ThemedText style={[styles.secondaryButtonText, { color: tintColor }]}>
                Duplicate
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, { backgroundColor }]}
              onPress={handleDelete}
            >
              <IconSymbol name="trash.fill" size={18} color="#FF5722" />
              <ThemedText style={[styles.secondaryButtonText, { color: '#FF5722' }]}>
                Delete
              </ThemedText>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  productImage: {
    width: width - 32,
    height: 400,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  infoSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 16,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  currentPrice: {
    paddingTop: 3,
    fontSize: 28,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stockInfo: {
    fontSize: 14,
    marginBottom: 4,
  },
  stockLabel: {
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  actionsSection: {
    gap: 12,
    marginBottom: 32,
  },
  primaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tryOnButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  tryOnButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
