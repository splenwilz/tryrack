import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

// Customer Virtual Try-On interfaces
interface CustomerTryOn {
  id: string;
  customerName: string;
  customerPhoto: string;
  productId: string;
  productName: string;
  productImage: string;
  tryOnResult: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
  customerFeedback?: string;
  rating?: number;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  price: number;
  brand: string;
}

// Mock data for customer virtual try-ons
const mockCustomerTryOns: CustomerTryOn[] = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    customerPhoto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop',
    productId: 'p1',
    productName: 'Designer Blazer',
    productImage: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=200&h=200&fit=crop',
    tryOnResult: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
    createdAt: '2024-01-15',
    status: 'completed',
    customerFeedback: 'Perfect fit! Love how it looks on me.',
    rating: 5
  },
  {
    id: '2',
    customerName: 'Michael Chen',
    customerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    productId: 'p2',
    productName: 'Silk Evening Dress',
    productImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop',
    tryOnResult: 'https://images.unsplash.com/photo-1594736797933-d0c29b8b0b8c?w=300&h=400&fit=crop',
    createdAt: '2024-01-14',
    status: 'completed',
    customerFeedback: 'Beautiful dress, fits perfectly!',
    rating: 4
  },
  {
    id: '3',
    customerName: 'Emma Wilson',
    customerPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    productId: 'p3',
    productName: 'Summer Maxi Dress',
    productImage: 'https://images.unsplash.com/photo-1594736797933-d0c29b8b0b8c?w=200&h=200&fit=crop',
    tryOnResult: '',
    createdAt: '2024-01-13',
    status: 'pending',
  },
  {
    id: '4',
    customerName: 'David Lee',
    customerPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    productId: 'p4',
    productName: 'Casual Denim Jacket',
    productImage: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200&h=200&fit=crop',
    tryOnResult: '',
    createdAt: '2024-01-12',
    status: 'failed',
    customerFeedback: 'The sizing seems off, could you help?'
  }
];

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Designer Blazer',
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=200&h=200&fit=crop',
    category: 'outerwear',
    price: 45000,
    brand: 'Fashion Forward'
  },
  {
    id: 'p2',
    name: 'Silk Evening Dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop',
    category: 'dress',
    price: 75000,
    brand: 'Elegance Co'
  },
  {
    id: 'p3',
    name: 'Summer Maxi Dress',
    imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0c29b8b0b8c?w=200&h=200&fit=crop',
    category: 'dress',
    price: 35000,
    brand: 'Casual Chic'
  },
  {
    id: 'p4',
    name: 'Casual Denim Jacket',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200&h=200&fit=crop',
    category: 'outerwear',
    price: 28000,
    brand: 'Urban Style'
  }
];

// Helper function to get product by ID
const getProductById = (productId: string): Product | undefined => {
  return mockProducts.find(product => product.id === productId);
};

/**
 * Customer Virtual Try-On Screen
 * Boutique owners can view and manage customer virtual try-on requests
 * Based on blueprint requirements for customer virtual try-on functionality
 */
export default function CustomerVirtualTryOnScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const [selectedFilter, setSelectedFilter] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  const handleBackPress = () => {
    router.back();
  };

  const handleSearchPress = () => {
    console.log('Search customer try-ons');
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'completed': return '#4CAF50';
      case 'failed': return '#FF5722';
      default: return iconColor;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'clock';
      case 'completed': return 'checkmark.circle.fill';
      case 'failed': return 'xmark.circle.fill';
      default: return 'questionmark.circle';
    }
  };

  const handleProcessTryOn = (tryOnId: string) => {
    Alert.alert(
      'Process Try-On',
      'Generate virtual try-on result for this customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Process', 
          onPress: () => {
            // TODO: Implement actual virtual try-on processing
            console.log(`Processing try-on ${tryOnId}`);
            Alert.alert('Processing', 'Virtual try-on is being generated...');
          }
        }
      ]
    );
  };

  const handleViewTryOnResult = (tryOn: CustomerTryOn) => {
    Alert.alert(
      'Try-On Result',
      `Customer: ${tryOn.customerName}\nProduct: ${tryOn.productName}\nRating: ${tryOn.rating || 'N/A'}/5\nFeedback: ${tryOn.customerFeedback || 'No feedback yet'}`,
      [
        { text: 'OK' },
        { 
          text: 'Share Result', 
          onPress: () => console.log('Share try-on result')
        }
      ]
    );
  };

  const handleContactCustomer = (customerName: string) => {
    Alert.alert(
      'Contact Customer',
      `Send message to ${customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Message', onPress: () => console.log(`Contacting ${customerName}`) }
      ]
    );
  };

  const filteredTryOns = React.useMemo(() => {
    let filtered = mockCustomerTryOns;
    
    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(tryOn => tryOn.status === selectedFilter);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(tryOn => 
        tryOn.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tryOn.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [selectedFilter, searchQuery]);

  const filterOptions = [
    { key: 'all', label: 'All Try-Ons', count: mockCustomerTryOns.length },
    { key: 'pending', label: 'Pending', count: mockCustomerTryOns.filter(t => t.status === 'pending').length },
    { key: 'completed', label: 'Completed', count: mockCustomerTryOns.filter(t => t.status === 'completed').length },
    { key: 'failed', label: 'Failed', count: mockCustomerTryOns.filter(t => t.status === 'failed').length },
  ];

  const renderTryOnCard = ({ item }: { item: CustomerTryOn }) => (
    <View style={[styles.tryOnCard, { backgroundColor }]}>
      <View style={styles.tryOnHeader}>
        <View style={styles.customerInfo}>
          <Image source={{ uri: item.customerPhoto }} style={styles.customerPhoto} />
          <View style={styles.customerDetails}>
            <ThemedText style={styles.customerName}>{item.customerName}</ThemedText>
            <ThemedText style={[styles.tryOnDate, { color: iconColor }]}>
              {item.createdAt}
            </ThemedText>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <IconSymbol 
            name={getStatusIcon(item.status) as 'clock' | 'checkmark.circle.fill' | 'xmark.circle.fill'} 
            size={12} 
            color="white" 
          />
          <ThemedText style={styles.statusText}>{item.status}</ThemedText>
        </View>
      </View>

      <View style={styles.productInfo}>
        <Image source={{ uri: item.productImage }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <ThemedText style={styles.productName}>{item.productName}</ThemedText>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <IconSymbol name="star.fill" size={14} color="#FFD700" />
              <ThemedText style={styles.ratingText}>{item.rating}/5</ThemedText>
            </View>
          )}
          {item.customerFeedback && (
            <ThemedText style={[styles.feedbackText, { color: iconColor }]} numberOfLines={2}>
              {item.customerFeedback}
            </ThemedText>
          )}
        </View>
      </View>

      {item.tryOnResult && (
        <View style={styles.tryOnResultContainer}>
          <ThemedText style={styles.resultLabel}>Try-On Result:</ThemedText>
          <Image source={{ uri: item.tryOnResult }} style={styles.tryOnResultImage} />
        </View>
      )}

      <View style={styles.actionButtons}>
        {item.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={() => handleProcessTryOn(item.id)}
          >
            <IconSymbol name="plus" size={14} color="white" />
            <ThemedText style={styles.actionButtonText}>Process Try-On</ThemedText>
          </TouchableOpacity>
        )}
        
        {item.status === 'completed' && item.tryOnResult && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={() => handleViewTryOnResult(item)}
          >
            <IconSymbol name="eye.fill" size={14} color="white" />
            <ThemedText style={styles.actionButtonText}>View Result</ThemedText>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => handleContactCustomer(item.customerName)}
        >
          <IconSymbol name="message.fill" size={14} color={tintColor} />
          <ThemedText style={[styles.secondaryButtonText, { color: tintColor }]}>
            Contact
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Customer Try-Ons"
        showBackButton={true}
        onBackPress={handleBackPress}
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        notificationCount={mockCustomerTryOns.filter(t => t.status === 'pending').length}
      />
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor }]}>
            <IconSymbol name="magnifyingglass" size={20} color={iconColor} />
            <TextInput
              style={[styles.searchInput, { color: useThemeColor({}, 'text') }]}
              placeholder="Search customers or products..."
              placeholderTextColor={iconColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.filterTabsContainer}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterTab,
                { backgroundColor: selectedFilter === option.key ? tintColor : backgroundColor },
                { borderColor: selectedFilter === option.key ? tintColor : iconColor }
              ]}
              onPress={() => setSelectedFilter(option.key)}
            >
              <ThemedText 
                style={[
                  styles.filterTabText, 
                  { color: selectedFilter === option.key ? 'white' : iconColor }
                ]}
              >
                {option.label} ({option.count})
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Try-Ons List */}
        <View style={styles.tryOnsList}>
          {filteredTryOns.map((tryOn) => (
            <View key={tryOn.id}>
              {renderTryOnCard({ item: tryOn })}
            </View>
          ))}
          
          {filteredTryOns.length === 0 && (
            <View style={styles.emptyState}>
              <IconSymbol name="camera.fill" size={48} color={iconColor} />
              <ThemedText style={styles.emptyStateTitle}>No Try-Ons Found</ThemedText>
              <ThemedText style={[styles.emptyStateDescription, { color: iconColor }]}>
                No customer try-ons match your current filter.
              </ThemedText>
            </View>
          )}
        </View>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterTabsContainer: {
    marginBottom: 20,
    paddingBottom: 5,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tryOnsList: {
    marginTop: 0,
  },
  tryOnCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tryOnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  tryOnDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  feedbackText: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  tryOnResultContainer: {
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tryOnResultImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    gap: 6,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
});
