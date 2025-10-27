import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, FlatList, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

// Extended product interface for comprehensive product management
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

// Mock data for comprehensive products
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Designer Blazer',
    category: 'outerwear',
    brand: 'Fashion Forward',
    price: 45000,
    originalPrice: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=200&h=200&fit=crop',
    sales: 45,
    revenue: 2025000,
    views: 1200,
    stock: 8,
    status: 'active',
    tags: ['formal', 'business', 'premium'],
    description: 'Elegant designer blazer perfect for business meetings and formal occasions.',
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
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop',
    sales: 32,
    revenue: 2400000,
    views: 980,
    stock: 3,
    status: 'active',
    tags: ['elegant', 'formal', 'luxury'],
    description: 'Luxurious silk evening dress for special occasions and formal events.',
    createdAt: '2024-01-02',
    lastUpdated: '2024-01-14',
    rating: 4.9,
    reviews: 18
  },
  {
    id: '3',
    name: 'Summer Maxi Dress',
    category: 'dress',
    brand: 'Casual Chic',
    price: 35000,
    originalPrice: 42000,
    imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0c29b8b0b8c?w=200&h=200&fit=crop',
    sales: 28,
    revenue: 980000,
    views: 750,
    stock: 0,
    status: 'out_of_stock',
    tags: ['casual', 'summer', 'comfortable'],
    description: 'Comfortable summer maxi dress perfect for casual outings and beach days.',
    createdAt: '2024-01-03',
    lastUpdated: '2024-01-13',
    rating: 4.6,
    reviews: 15
  },
  {
    id: '4',
    name: 'Casual Denim Jacket',
    category: 'outerwear',
    brand: 'Urban Style',
    price: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200&h=200&fit=crop',
    sales: 22,
    revenue: 616000,
    views: 650,
    stock: 12,
    status: 'active',
    tags: ['casual', 'denim', 'versatile'],
    description: 'Classic denim jacket that pairs well with any casual outfit.',
    createdAt: '2024-01-04',
    lastUpdated: '2024-01-12',
    rating: 4.4,
    reviews: 12
  },
  {
    id: '5',
    name: 'Formal Business Suit',
    category: 'suit',
    brand: 'Professional Wear',
    price: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    sales: 15,
    revenue: 1425000,
    views: 450,
    stock: 5,
    status: 'active',
    tags: ['formal', 'business', 'professional'],
    description: 'Premium business suit for important meetings and corporate events.',
    createdAt: '2024-01-05',
    lastUpdated: '2024-01-11',
    rating: 4.7,
    reviews: 8
  },
  {
    id: '6',
    name: 'Elegant Cocktail Dress',
    category: 'dress',
    brand: 'Evening Glam',
    price: 65000,
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop',
    sales: 18,
    revenue: 1170000,
    views: 580,
    stock: 7,
    status: 'active',
    tags: ['elegant', 'cocktail', 'party'],
    description: 'Stunning cocktail dress perfect for parties and special occasions.',
    createdAt: '2024-01-06',
    lastUpdated: '2024-01-10',
    rating: 4.5,
    reviews: 11
  }
];

/**
 * Boutique Products Screen
 * Comprehensive product management with analytics and inventory tracking
 * Based on blueprint requirements for boutique catalog management
 */
export default function BoutiqueProductsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const [selectedFilter, setSelectedFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<string>('sales');
  const [showAddProductModal, setShowAddProductModal] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  
  // Product form state
  const [productForm, setProductForm] = React.useState({
    name: '',
    category: '',
    brand: '',
    price: '',
    originalPrice: '',
    description: '',
    stock: '',
    tags: '',
    imageUrl: '',
  });

  const handleBackPress = () => {
    // Navigate back to dashboard
    console.log('Navigate back to dashboard');
  };

  const handleSearchPress = () => {
    console.log('Search products');
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed');
  };

  const handleAddProduct = () => {
    setProductForm({
      name: '',
      category: '',
      brand: '',
      price: '',
      originalPrice: '',
      description: '',
      stock: '',
      tags: '',
      imageUrl: '',
    });
    setEditingProduct(null);
    setShowAddProductModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      category: product.category,
      brand: product.brand,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      description: product.description,
      stock: product.stock.toString(),
      tags: product.tags.join(', '),
      imageUrl: product.imageUrl,
    });
    setEditingProduct(product);
    setShowAddProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.category || !productForm.brand || !productForm.price) {
      Alert.alert('Missing Information', 'Please fill in all required fields (Name, Category, Brand, Price)');
      return;
    }

    const price = parseInt(productForm.price);
    const originalPrice = productForm.originalPrice ? parseInt(productForm.originalPrice) : undefined;
    const stock = parseInt(productForm.stock) || 0;

    if (Number.isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price greater than 0');
      return;
    }

    if (originalPrice && (Number.isNaN(originalPrice) || originalPrice <= price)) {
      Alert.alert('Invalid Original Price', 'Original price must be greater than current price');
      return;
    }

    const newProduct: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: productForm.name.trim(),
      category: productForm.category.trim(),
      brand: productForm.brand.trim(),
      price: price,
      originalPrice: originalPrice,
      imageUrl: productForm.imageUrl || 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=200&h=200&fit=crop',
      sales: editingProduct?.sales || 0,
      revenue: editingProduct?.revenue || 0,
      views: editingProduct?.views || 0,
      stock: stock,
      status: editingProduct?.status || 'active',
      tags: productForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      description: productForm.description.trim(),
      createdAt: editingProduct?.createdAt || new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      rating: editingProduct?.rating || 0,
      reviews: editingProduct?.reviews || 0,
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProduct : p));
      Alert.alert('Success', 'Product updated successfully!');
    } else {
      setProducts(prev => [...prev, newProduct]);
      Alert.alert('Success', 'Product added successfully!');
    }

    setShowAddProductModal(false);
    setProductForm({
      name: '',
      category: '',
      brand: '',
      price: '',
      originalPrice: '',
      description: '',
      stock: '',
      tags: '',
      imageUrl: '',
    });
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProducts(prev => prev.filter(p => p.id !== productId));
          }
        }
      ]
    );
  };

  const handleToggleProductStatus = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
        : p
    ));
  };

  const handleImageUpload = () => {
    Alert.alert(
      'Select Image',
      'Choose how you\'d like to add a product image',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Camera', 
          onPress: () => {
            // Mock camera functionality
            const mockImageUrl = 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=200&h=200&fit=crop';
            setProductForm(prev => ({ ...prev, imageUrl: mockImageUrl }));
            Alert.alert('Success', 'Image captured successfully!');
          }
        },
        { 
          text: 'Gallery', 
          onPress: () => {
            // Mock gallery functionality
            const mockImageUrl = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop';
            setProductForm(prev => ({ ...prev, imageUrl: mockImageUrl }));
            Alert.alert('Success', 'Image selected from gallery!');
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#FFA500';
      case 'out_of_stock': return '#FF5722';
      default: return iconColor;
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return '#FF5722';
    if (stock < 5) return '#FFA500';
    return '#4CAF50';
  };

  const filteredProducts = React.useMemo(() => {
    let filtered = [...products]; // Create a copy to avoid mutating the original array
    
    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(product => product.status === selectedFilter);
    }
    
    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'sales':
          return b.sales - a.sales;
        case 'revenue':
          return b.revenue - a.revenue;
        case 'views':
          return b.views - a.views;
        case 'price':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [products, selectedFilter, sortBy]);

  const filterOptions = [
    { key: 'all', label: 'All Products', count: products.length },
    { key: 'active', label: 'Active', count: products.filter(p => p.status === 'active').length },
    { key: 'out_of_stock', label: 'Out of Stock', count: products.filter(p => p.status === 'out_of_stock').length },
    { key: 'inactive', label: 'Inactive', count: products.filter(p => p.status === 'inactive').length },
  ];

  const sortOptions = [
    { key: 'sales', label: 'Sales' },
    { key: 'revenue', label: 'Revenue' },
    { key: 'views', label: 'Views' },
    { key: 'price', label: 'Price' },
    { key: 'rating', label: 'Rating' },
  ];

  const handleProductAction = (product: Product, action: string) => {
    switch (action) {
      case 'edit':
        handleEditProduct(product);
        break;
      case 'delete':
        handleDeleteProduct(product.id);
        break;
      case 'toggle':
        handleToggleProductStatus(product.id);
        break;
      case 'duplicate':
        handleDuplicateProduct(product);
        break;
      case 'view':
        handleViewProductDetails(product);
        break;
      default:
        console.log(`Product ${product.id}: ${action}`);
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicatedProduct: Product = {
      ...product,
      id: Date.now().toString(),
      name: `${product.name} (Copy)`,
      sales: 0,
      revenue: 0,
      views: 0,
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      rating: 0,
      reviews: 0,
    };

    setProducts(prev => [...prev, duplicatedProduct]);
    Alert.alert('Success', 'Product duplicated successfully!');
  };

  const handleViewProductDetails = (product: Product) => {
    Alert.alert(
      'Product Details',
      `Name: ${product.name}\nBrand: ${product.brand}\nCategory: ${product.category}\nPrice: ₦${product.price.toLocaleString()}\nStock: ${product.stock}\nStatus: ${product.status}\nSales: ${product.sales}\nRevenue: ₦${product.revenue.toLocaleString()}\nRating: ${product.rating}/5\nReviews: ${product.reviews}\nCreated: ${product.createdAt}\nLast Updated: ${product.lastUpdated}`,
      [{ text: 'OK' }]
    );
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={[styles.productCard, { backgroundColor }]}
      onPress={() => router.push(`/(boutique)/product-detail?productId=${item.id}`)}
      onLongPress={() => handleProductAction(item, 'edit')}
      delayLongPress={500}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        <View style={styles.productBadges}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <ThemedText style={styles.statusText}>{item.status.replace('_', ' ')}</ThemedText>
          </View>
          {item.originalPrice && (
            <View style={styles.discountBadge}>
              <ThemedText style={styles.discountText}>
                -{Math.round((1 - item.price / item.originalPrice) * 100)}%
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <ThemedText style={styles.productName} numberOfLines={2}>{item.name}</ThemedText>
          <ThemedText style={[styles.productBrand, { color: iconColor }]}>{item.brand}</ThemedText>
        </View>

        <View style={styles.productStats}>
          <View style={styles.statItem}>
            <IconSymbol name="bag.fill" size={14} color={iconColor} />
            <ThemedText style={[styles.statText, { color: iconColor }]}>{item.sales} sales</ThemedText>
          </View>
          <View style={styles.statItem}>
            <IconSymbol name="star.fill" size={14} color="#FFD700" />
            <ThemedText style={[styles.statText, { color: iconColor }]}>
              {item.rating} ({item.reviews})
            </ThemedText>
          </View>
        </View>

        <View style={styles.productFooter}>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.currentPrice}>₦{item.price.toLocaleString()}</ThemedText>
            {item.originalPrice && (
              <ThemedText style={styles.originalPrice}>
                ₦{item.originalPrice.toLocaleString()}
              </ThemedText>
            )}
          </View>
          <View style={styles.stockContainer}>
            <View style={[styles.stockIndicator, { backgroundColor: getStockColor(item.stock) }]} />
            <ThemedText style={[styles.stockText, { color: getStockColor(item.stock) }]}>
              {item.stock} left
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Products"
        showBackButton={true}
        onBackPress={handleBackPress}
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
      />
      
      {/* Add Product Button */}
      <View style={styles.addProductContainer}>
        <TouchableOpacity 
          style={[styles.addProductButton, { backgroundColor: tintColor }]}
          onPress={handleAddProduct}
        >
          <IconSymbol name="plus" size={20} color="white" />
          <ThemedText style={styles.addProductText}>Add New Product</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {/* Filter and Sort Controls */}
        <View style={styles.controlsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  { backgroundColor: selectedFilter === filter.key ? tintColor : backgroundColor },
                  selectedFilter === filter.key && styles.activeFilterTab
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <ThemedText 
                  style={[
                    styles.filterText,
                    { color: selectedFilter === filter.key ? 'white' : iconColor }
                  ]}
                >
                  {filter.label}
                </ThemedText>
                <View style={[
                  styles.filterCount,
                  { backgroundColor: selectedFilter === filter.key ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)' }
                ]}>
                  <ThemedText 
                    style={[
                      styles.filterCountText,
                      { color: selectedFilter === filter.key ? 'white' : iconColor }
                    ]}
                  >
                    {filter.count}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sortSection}>
            <ThemedText style={[styles.sortLabel, { color: iconColor }]}>Sort by:</ThemedText>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sortContainer}
            >
              {sortOptions.map((sort) => (
                <TouchableOpacity
                  key={sort.key}
                  style={[
                    styles.sortTab,
                    { backgroundColor: sortBy === sort.key ? tintColor : backgroundColor },
                    sortBy === sort.key && styles.activeSortTab
                  ]}
                  onPress={() => setSortBy(sort.key)}
                >
                  <ThemedText 
                    style={[
                      styles.sortText,
                      { color: sortBy === sort.key ? 'white' : iconColor }
                    ]}
                  >
                    {sort.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Products List */}
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <IconSymbol name="bag.fill" size={48} color={iconColor} />
              <ThemedText style={styles.emptyStateTitle}>No Products Found</ThemedText>
              <ThemedText style={[styles.emptyStateDescription, { color: iconColor }]}>
                No products match the selected filter.
              </ThemedText>
            </View>
          }
        />
      </View>

      {/* Product Upload Modal */}
      <Modal
        visible={showAddProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddProductModal(false)}>
              <ThemedText style={[styles.modalCancelText, { color: tintColor }]}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <ThemedText type="subtitle" style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </ThemedText>
            <TouchableOpacity onPress={handleSaveProduct}>
              <ThemedText style={[styles.modalSaveText, { color: tintColor }]}>
                Save
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Image Upload Section */}
            <View style={styles.imageUploadSection}>
              <ThemedText style={styles.sectionLabel}>Product Image *</ThemedText>
              <TouchableOpacity 
                style={[styles.imageUploadButton, { backgroundColor }]}
                onPress={handleImageUpload}
              >
                {productForm.imageUrl ? (
                  <Image source={{ uri: productForm.imageUrl }} style={styles.previewImage} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <IconSymbol name="camera.fill" size={32} color={iconColor} />
                    <ThemedText style={[styles.uploadText, { color: iconColor }]}>
                      Tap to add image
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Product Details Form */}
            <View style={styles.formSection}>
              <ThemedText style={styles.sectionLabel}>Product Details</ThemedText>
              
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Product Name *</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor, color: useThemeColor({}, 'text') }]}
                  value={productForm.name}
                  onChangeText={(text) => setProductForm(prev => ({ ...prev, name: text }))}
                  placeholder="Enter product name"
                  placeholderTextColor={iconColor}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <ThemedText style={styles.inputLabel}>Category *</ThemedText>
                  <TextInput
                    style={[styles.textInput, { backgroundColor, color: useThemeColor({}, 'text') }]}
                    value={productForm.category}
                    onChangeText={(text) => setProductForm(prev => ({ ...prev, category: text }))}
                    placeholder="e.g., dress, top"
                    placeholderTextColor={iconColor}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <ThemedText style={styles.inputLabel}>Brand *</ThemedText>
                  <TextInput
                    style={[styles.textInput, { backgroundColor, color: useThemeColor({}, 'text') }]}
                    value={productForm.brand}
                    onChangeText={(text) => setProductForm(prev => ({ ...prev, brand: text }))}
                    placeholder="Brand name"
                    placeholderTextColor={iconColor}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <ThemedText style={styles.inputLabel}>Price (₦) *</ThemedText>
                  <TextInput
                    style={[styles.textInput, { backgroundColor, color: useThemeColor({}, 'text') }]}
                    value={productForm.price}
                    onChangeText={(text) => setProductForm(prev => ({ ...prev, price: text }))}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={iconColor}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <ThemedText style={styles.inputLabel}>Original Price (₦)</ThemedText>
                  <TextInput
                    style={[styles.textInput, { backgroundColor, color: useThemeColor({}, 'text') }]}
                    value={productForm.originalPrice}
                    onChangeText={(text) => setProductForm(prev => ({ ...prev, originalPrice: text }))}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={iconColor}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <ThemedText style={styles.inputLabel}>Stock Quantity</ThemedText>
                  <TextInput
                    style={[styles.textInput, { backgroundColor, color: useThemeColor({}, 'text') }]}
                    value={productForm.stock}
                    onChangeText={(text) => setProductForm(prev => ({ ...prev, stock: text }))}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor={iconColor}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <ThemedText style={styles.inputLabel}>Tags</ThemedText>
                  <TextInput
                    style={[styles.textInput, { backgroundColor, color: useThemeColor({}, 'text') }]}
                    value={productForm.tags}
                    onChangeText={(text) => setProductForm(prev => ({ ...prev, tags: text }))}
                    placeholder="casual, formal, summer"
                    placeholderTextColor={iconColor}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Description</ThemedText>
                <TextInput
                  style={[styles.textArea, { backgroundColor, color: useThemeColor({}, 'text') }]}
                  value={productForm.description}
                  onChangeText={(text) => setProductForm(prev => ({ ...prev, description: text }))}
                  placeholder="Describe your product..."
                  placeholderTextColor={iconColor}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  controlsContainer: {
    paddingVertical: 16,
  },
  filterContainer: {
    paddingBottom: 12,
    paddingRight: 20,
  },
  sortContainer: {
    paddingRight: 20,
  },
  sortSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  activeFilterTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  filterCount: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  activeSortTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
  },
  productsList: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  productBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  discountBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  editHint: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 12,
    opacity: 0.7,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 10,
    marginLeft: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  originalPrice: {
    fontSize: 12,
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Additional Action Styles
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  additionalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  iconButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconButtonText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    width: '100%',
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
  },
  // Add Product Button Styles
  addProductContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addProductText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Modal Styles
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
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Image Upload Styles
  imageUploadSection: {
    marginVertical: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  imageUploadButton: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
  },
  // Form Styles
  formSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
});