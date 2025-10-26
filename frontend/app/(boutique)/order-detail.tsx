import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router, useLocalSearchParams } from 'expo-router';
import { withAlpha } from '@/constants/theme';

// Order interface matching orders screen
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

// Mock orders data
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customerName: 'Sarah Johnson',
    customerEmail: 'sarah.johnson@email.com',
    itemName: 'Designer Blazer',
    itemImage: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=300&h=300&fit=crop',
    amount: 45000,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: '123 Victoria Island, Lagos, Nigeria',
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
    itemImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop',
    amount: 75000,
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: '456 Ikoyi, Lagos, Nigeria',
    orderDate: '2024-01-15'
  },
];

/**
 * Order Detail Screen
 * Comprehensive order view with full customer and shipping information
 */
export default function OrderDetailScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const { orderId } = useLocalSearchParams();
  
  const order = mockOrders.find(o => o.id === orderId);
  
  const handleBackPress = () => {
    router.back();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#2196F3';
      case 'shipped': return '#4CAF50';
      case 'delivered': return '#00BCD4';
      case 'cancelled': return '#FF5722';
      default: return iconColor;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'clock';
      case 'confirmed': return 'checkmark.circle';
      case 'shipped': return 'paperplane';
      case 'delivered': return 'checkmark.circle.fill';
      case 'cancelled': return 'xmark.circle.fill';
      default: return 'circle';
    }
  };

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FFA500';
      case 'failed': return '#FF5722';
      case 'refunded': return '#9E9E9E';
      default: return iconColor;
    }
  };

  const handleUpdateStatus = () => {
    Alert.alert('Update Status', 'This will allow you to update the order status');
  };

  const handleContactCustomer = () => {
    if (order) {
      Alert.alert('Contact Customer', `Email: ${order.customerEmail}`);
    }
  };

  const handleViewTracking = () => {
    if (order?.trackingNumber) {
      Alert.alert('Tracking Number', order.trackingNumber);
    }
  };

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="Order Details" showBackButton={true} onBackPress={handleBackPress} />
        <View style={styles.centerContent}>
          <ThemedText>Order not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader 
        title="Order Details" 
        showBackButton={true} 
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={[styles.statusCard, { backgroundColor }]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <IconSymbol 
                name={getStatusIcon(order.status) as 'clock' | 'checkmark.circle' | 'paperplane' | 'checkmark.circle.fill' | 'xmark.circle.fill' | 'circle'} 
                size={16} 
                color="white" 
              />
              <ThemedText style={styles.statusText}>
                {order.status.toUpperCase()}
              </ThemedText>
            </View>
            <View style={[styles.paymentBadge, { backgroundColor: getPaymentStatusColor(order.paymentStatus) }]}>
              <ThemedText style={styles.paymentText}>
                {order.paymentStatus.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={styles.orderNumber}>Order #{order.orderNumber}</ThemedText>
          <ThemedText style={[styles.orderDate, { color: iconColor }]}>
            Ordered on {order.orderDate}
          </ThemedText>
        </View>

        {/* Product Information */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Product</ThemedText>
          <View style={styles.productInfo}>
            <Image source={{ uri: order.itemImage }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <ThemedText type="title" style={styles.productName}>{order.itemName}</ThemedText>
              <ThemedText style={[styles.productPrice, { color: iconColor }]}>
                ₦{order.amount.toLocaleString()}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Customer</ThemedText>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: iconColor }]}>Name</ThemedText>
              <ThemedText style={styles.infoValue}>{order.customerName}</ThemedText>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: iconColor }]}>Email</ThemedText>
              <ThemedText style={styles.infoValue}>{order.customerEmail}</ThemedText>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: withAlpha(tintColor, 0.125) }]}
            onPress={handleContactCustomer}
          >
            <IconSymbol name="envelope.fill" size={18} color={tintColor} />
            <ThemedText 
            style={[styles.actionButtonText, { color: tintColor }]}>
              Contact Customer
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Shipping Information */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Shipping</ThemedText>
          
          <View style={styles.infoRow}>
            <IconSymbol name="location" size={20} color={iconColor} />
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoValue}>{order.shippingAddress}</ThemedText>
            </View>
          </View>

          {order.estimatedDelivery && (
            <View style={styles.infoRow}>
              <IconSymbol name="calendar" size={20} color={iconColor} />
              <View style={styles.infoItem}>
                <ThemedText style={[styles.infoLabel, { color: iconColor }]}>Estimated Delivery</ThemedText>
                <ThemedText style={styles.infoValue}>{order.estimatedDelivery}</ThemedText>
              </View>
            </View>
          )}

          {order.trackingNumber && (
            <View style={styles.infoRow}>
              <IconSymbol name="paperplane" size={20} color={iconColor} />
              <View style={styles.infoItem}>
                <ThemedText style={[styles.infoLabel, { color: iconColor }]}>Tracking Number</ThemedText>
                <View style={styles.trackingContainer}>
                  <ThemedText style={styles.trackingNumber}>{order.trackingNumber}</ThemedText>
                  <TouchableOpacity onPress={handleViewTracking}>
                    <ThemedText style={[styles.trackingButton, { color: tintColor }]}>
                      View
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Order Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: tintColor }]}
            onPress={handleUpdateStatus}
          >
            <IconSymbol name="pencil" size={18} color="white" />
            <ThemedText style={styles.primaryButtonText}>Update Status</ThemedText>
          </TouchableOpacity>

          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <TouchableOpacity 
              style={[styles.secondaryButton, { borderColor: iconColor }]}
              onPress={() => Alert.alert('Mark as Delivered', 'Mark this order as delivered?')}
            >
              <IconSymbol name="checkmark.circle.fill" size={18} color={iconColor} />
              <ThemedText style={[styles.secondaryButtonText, { color: iconColor }]}>
                Mark as Delivered
              </ThemedText>
            </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  paymentText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    opacity: 0.7,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  productInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  productImage: {
    width: 100,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 4,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  trackingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingNumber: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  trackingButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsSection: {
    gap: 12,
    marginBottom: 32,
    paddingTop: 20,
  },
  primaryButton: {
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
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
