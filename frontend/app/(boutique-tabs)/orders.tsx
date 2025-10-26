import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

// Extended order interface for comprehensive order management
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  itemName: string;
  itemImage: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: string;
  orderDate: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

// Mock data for comprehensive orders
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@email.com',
    itemName: 'Designer Blazer',
    itemImage: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=100&h=100&fit=crop',
    amount: 45000,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: '123 Victoria Island, Lagos',
    orderDate: '2024-01-15',
    estimatedDelivery: '2024-01-18',
    trackingNumber: 'TRK123456789'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customerName: 'Michael Chen',
    customerEmail: 'michael.chen@email.com',
    itemName: 'Silk Evening Dress',
    itemImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop',
    amount: 75000,
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: '456 Ikoyi, Lagos',
    orderDate: '2024-01-15'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customerName: 'Emma Wilson',
    customerEmail: 'emma.wilson@email.com',
    itemName: 'Summer Maxi Dress',
    itemImage: 'https://images.unsplash.com/photo-1594736797933-d0c29b8b0b8c?w=100&h=100&fit=crop',
    amount: 35000,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: '789 Lekki Phase 1, Lagos',
    orderDate: '2024-01-14',
    estimatedDelivery: '2024-01-17'
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-004',
    customerName: 'David Brown',
    customerEmail: 'david.brown@email.com',
    itemName: 'Casual Denim Jacket',
    itemImage: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=100&h=100&fit=crop',
    amount: 28000,
    status: 'confirmed',
    paymentStatus: 'paid',
    shippingAddress: '321 Surulere, Lagos',
    orderDate: '2024-01-15'
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-005',
    customerName: 'Lisa Garcia',
    customerEmail: 'lisa.garcia@email.com',
    itemName: 'Formal Business Suit',
    itemImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    amount: 95000,
    status: 'cancelled',
    paymentStatus: 'refunded',
    shippingAddress: '654 Gbagada, Lagos',
    orderDate: '2024-01-13'
  },
  {
    id: '6',
    orderNumber: 'ORD-2024-006',
    customerName: 'James Taylor',
    customerEmail: 'james.taylor@email.com',
    itemName: 'Elegant Cocktail Dress',
    itemImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop',
    amount: 65000,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: '987 Magodo, Lagos',
    orderDate: '2024-01-14',
    estimatedDelivery: '2024-01-17',
    trackingNumber: 'TRK987654321'
  }
];

/**
 * Boutique Orders Screen
 * Comprehensive order management with filtering and status tracking
 * Based on blueprint requirements for boutique order management
 */
export default function BoutiqueOrdersScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const [selectedFilter, setSelectedFilter] = React.useState<string>('all');

  const handleBackPress = () => {
    // Navigate back to dashboard
    console.log('Navigate back to dashboard');
  };

  const handleSearchPress = () => {
    console.log('Search orders');
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#2196F3';
      case 'shipped': return '#007AFF';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#FF5722';
      default: return iconColor;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FFA500';
      case 'failed': return '#FF5722';
      case 'refunded': return '#9E9E9E';
      default: return iconColor;
    }
  };

  const filteredOrders = selectedFilter === 'all' 
    ? mockOrders 
    : mockOrders.filter(order => order.status === selectedFilter);

  const filterOptions = [
    { key: 'all', label: 'All Orders', count: mockOrders.length },
    { key: 'pending', label: 'Pending', count: mockOrders.filter(o => o.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmed', count: mockOrders.filter(o => o.status === 'confirmed').length },
    { key: 'shipped', label: 'Shipped', count: mockOrders.filter(o => o.status === 'shipped').length },
    { key: 'delivered', label: 'Delivered', count: mockOrders.filter(o => o.status === 'delivered').length },
    { key: 'cancelled', label: 'Cancelled', count: mockOrders.filter(o => o.status === 'cancelled').length },
  ];

  const handleOrderAction = (orderId: string, action: string) => {
    console.log(`Order ${orderId}: ${action}`);
    // TODO: Implement order actions (confirm, ship, cancel, etc.)
  };

  const renderOrderCard = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={[styles.orderCard, { backgroundColor }]}
      onPress={() => {
        const url = `/(boutique)/order-detail?orderId=${item.id}`;
        console.log('url', url);
        // @ts-expect-error - Expo Router dynamic route typing
        router.push(url);
      }}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <ThemedText style={styles.orderNumber}>{item.orderNumber}</ThemedText>
          <ThemedText style={[styles.customerName, { color: iconColor }]}>
            {item.customerName}
          </ThemedText>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <ThemedText style={styles.statusText}>{item.status}</ThemedText>
          </View>
          <View style={[styles.paymentBadge, { backgroundColor: getPaymentStatusColor(item.paymentStatus) }]}>
            <ThemedText style={styles.paymentText}>{item.paymentStatus}</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.orderContent}>
        <Image source={{ uri: item.itemImage }} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <ThemedText style={styles.itemName}>{item.itemName}</ThemedText>
          <ThemedText style={styles.orderAmount}>₦{item.amount.toLocaleString()}</ThemedText>
          <ThemedText style={[styles.orderDate, { color: iconColor }]}>
            Ordered: {item.orderDate}
          </ThemedText>
          {item.estimatedDelivery && (
            <ThemedText style={[styles.deliveryDate, { color: iconColor }]}>
              Est. Delivery: {item.estimatedDelivery}
            </ThemedText>
          )}
          {item.trackingNumber && (
            <ThemedText style={[styles.trackingNumber, { color: tintColor }]}>
              Tracking: {item.trackingNumber}
            </ThemedText>
          )}
        </View>
      </View>

      <View style={styles.orderActions}>
        {item.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={() => handleOrderAction(item.id, 'confirm')}
          >
            <ThemedText style={styles.actionButtonText}>Confirm Order</ThemedText>
          </TouchableOpacity>
        )}
        {item.status === 'confirmed' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={() => handleOrderAction(item.id, 'ship')}
          >
            <ThemedText style={styles.actionButtonText}>Mark as Shipped</ThemedText>
          </TouchableOpacity>
        )}
        {item.status === 'shipped' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => handleOrderAction(item.id, 'deliver')}
          >
            <ThemedText style={styles.actionButtonText}>Mark as Delivered</ThemedText>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => handleOrderAction(item.id, 'view')}
        >
          <ThemedText style={[styles.secondaryButtonText, { color: tintColor }]}>
            View Details
          </ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Orders"
        showBackButton={true}
        onBackPress={handleBackPress}
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
      />
      
      <View style={styles.content}>
        {/* Filter Tabs */}
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

        {/* Orders List */}
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <IconSymbol name="bag.fill" size={48} color={iconColor} />
              <ThemedText style={styles.emptyStateTitle}>No Orders Found</ThemedText>
              <ThemedText style={[styles.emptyStateDescription, { color: iconColor }]}>
                No orders match the selected filter.
              </ThemedText>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },
  content: {
    // flex: 1,
    paddingHorizontal: 20,
  },
  filterContainer: {
    paddingVertical: 16,
    paddingRight: 20,
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
    shadowOffset: { width: 0, height: 0 },
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
    paddingVertical: 3,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: -3
  },
  ordersList: {
    paddingBottom: 20,
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  paymentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  paymentText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  deliveryDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  trackingNumber: {
    fontSize: 12,
    fontWeight: '500',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  },
});