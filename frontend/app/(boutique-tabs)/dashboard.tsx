import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

// Demo data interfaces
interface SalesMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
}

interface RecentOrder {
  id: string;
  customerName: string;
  itemName: string;
  amount: number;
  status: 'pending' | 'shipped' | 'delivered';
  date: string;
  imageUrl: string;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  imageUrl: string;
}

// Demo data
const mockSalesMetrics: SalesMetric[] = [
  {
    id: '1',
    title: 'Total Revenue',
    value: '₦2,450,000',
    change: 12.5,
    trend: 'up',
    icon: 'dollarsign'
  },
  {
    id: '2',
    title: 'Orders Today',
    value: '23',
    change: 8.2,
    trend: 'up',
    icon: 'bag.fill'
  },
  {
    id: '3',
    title: 'Conversion Rate',
    value: '3.2%',
    change: -2.1,
    trend: 'down',
    icon: 'chart.bar.fill'
  },
  {
    id: '4',
    title: 'Avg Order Value',
    value: '₦15,200',
    change: 5.7,
    trend: 'up',
    icon: 'chart.line.uptrend.xyaxis'
  }
];

const mockRecentOrders: RecentOrder[] = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    itemName: 'Designer Blazer',
    amount: 45000,
    status: 'shipped',
    date: '2 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=100&h=100&fit=crop'
  },
  {
    id: '2',
    customerName: 'Michael Chen',
    itemName: 'Silk Evening Dress',
    amount: 75000,
    status: 'pending',
    date: '4 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop'
  },
  {
    id: '3',
    customerName: 'Emma Wilson',
    itemName: 'Summer Maxi Dress',
    amount: 35000,
    status: 'delivered',
    date: '1 day ago',
    imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0c29b8b0b8c?w=100&h=100&fit=crop'
  }
];

const mockTopProducts: TopProduct[] = [
  {
    id: '1',
    name: 'Designer Blazer',
    sales: 45,
    revenue: 2025000,
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=100&h=100&fit=crop'
  },
  {
    id: '2',
    name: 'Silk Evening Dress',
    sales: 32,
    revenue: 2400000,
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop'
  },
  {
    id: '3',
    name: 'Summer Maxi Dress',
    sales: 28,
    revenue: 980000,
    imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0c29b8b0b8c?w=100&h=100&fit=crop'
  }
];

/**
 * Boutique Dashboard Screen
 * Overview of boutique performance and key metrics
 * Based on blueprint requirements for boutique analytics
 */
export default function BoutiqueDashboardScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const handleSearchPress = () => {
    console.log('Search pressed - implement search functionality');
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed - implement notification screen');
  };

  const handleViewAllOrders = () => {
    router.push('/(boutique-tabs)/orders');
  };

  const handleViewAllProducts = () => {
    router.push('/(boutique-tabs)/catalog');
  };

  const handleViewCustomerTryOns = () => {
    router.push('/(boutique-tabs)/customer-tryon');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'shipped': return '#007AFF';
      case 'delivered': return '#4CAF50';
      default: return iconColor;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'arrow.up';
      case 'down': return 'arrow.down';
      default: return 'minus';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#4CAF50';
      case 'down': return '#FF5722';
      default: return iconColor;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Dashboard"
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <ThemedText type="title" style={styles.welcomeTitle}>
            Welcome back! 👋
          </ThemedText>
          <ThemedText style={[styles.welcomeSubtitle, { color: iconColor }]}>
            Here&apos;s what&apos;s happening with your boutique today
          </ThemedText>
        </View>

        {/* Sales Metrics Grid */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Today&apos;s Performance
          </ThemedText>
          <View style={styles.metricsGrid}>
            {mockSalesMetrics.map((metric) => (
              <View key={metric.id} style={[styles.metricCard, { backgroundColor }]}>
                <View style={styles.metricHeader}>
                  <IconSymbol 
                    name={metric.icon as 'dollarsign' | 'bag.fill' | 'chart.bar.fill' | 'chart.line.uptrend.xyaxis'} 
                    size={20} 
                    color={tintColor} 
                  />
                  <View style={styles.trendContainer}>
                    <IconSymbol 
                      name={getTrendIcon(metric.trend) as 'arrow.up' | 'arrow.down' | 'minus'} 
                      size={12} 
                      color={getTrendColor(metric.trend)} 
                    />
                    <ThemedText style={[styles.trendText, { color: getTrendColor(metric.trend) }]}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.metricValue}>{metric.value}</ThemedText>
                <ThemedText style={[styles.metricTitle, { color: iconColor }]}>
                  {metric.title}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Recent Orders
            </ThemedText>
            <TouchableOpacity onPress={handleViewAllOrders}>
              <ThemedText style={[styles.viewAllText, { color: tintColor }]}>
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.ordersList}>
            {mockRecentOrders.map((order) => (
              <TouchableOpacity key={order.id} style={[styles.orderCard, { backgroundColor }]}>
                <Image source={{ uri: order.imageUrl }} style={styles.orderImage} />
                <View style={styles.orderInfo}>
                  <ThemedText style={styles.customerName}>{order.customerName}</ThemedText>
                  <ThemedText style={[styles.itemName, { color: iconColor }]}>
                    {order.itemName}
                  </ThemedText>
                  <View style={styles.orderFooter}>
                    <ThemedText style={styles.orderAmount}>
                      ₦{order.amount.toLocaleString()}
                    </ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                      <ThemedText style={styles.statusText}>{order.status}</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.orderDate, { color: iconColor }]}>
                    {order.date}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Customer Try-Ons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Customer Try-Ons
            </ThemedText>
            <TouchableOpacity onPress={handleViewCustomerTryOns}>
              <ThemedText style={[styles.viewAllText, { color: tintColor }]}>
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.tryOnsList}>
            <View style={[styles.tryOnCard, { backgroundColor }]}>
              <View style={styles.tryOnHeader}>
                <View style={styles.customerInfo}>
                  <View style={styles.customerAvatar}>
                    <ThemedText style={styles.customerInitial}>SJ</ThemedText>
                  </View>
                  <View style={styles.customerDetails}>
                    <ThemedText style={styles.tryOnCustomerName}>Sarah Johnson</ThemedText>
                    <ThemedText style={[styles.tryOnDate, { color: iconColor }]}>2 hours ago</ThemedText>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#FFA500' }]}>
                  <ThemedText style={styles.statusText}>Pending</ThemedText>
                </View>
              </View>
              <View style={styles.tryOnProductInfo}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=60&h=60&fit=crop' }} style={styles.productImage} />
                <View style={styles.tryOnProductDetails}>
                  <ThemedText style={styles.productName}>Designer Blazer</ThemedText>
                  <ThemedText style={[styles.productPrice, { color: iconColor }]}>₦45,000</ThemedText>
                </View>
              </View>
            </View>
            
            <View style={[styles.tryOnCard, { backgroundColor }]}>
              <View style={styles.tryOnHeader}>
                <View style={styles.customerInfo}>
                  <View style={styles.customerAvatar}>
                    <ThemedText style={styles.customerInitial}>MC</ThemedText>
                  </View>
                  <View style={styles.customerDetails}>
                    <ThemedText style={styles.tryOnCustomerName}>Michael Chen</ThemedText>
                    <ThemedText style={[styles.tryOnDate, { color: iconColor }]}>1 day ago</ThemedText>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
                  <ThemedText style={styles.statusText}>Completed</ThemedText>
                </View>
              </View>
              <View style={styles.tryOnProductInfo}>
                <Image source={{ uri: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=60&h=60&fit=crop' }} style={styles.productImage} />
                <View style={styles.tryOnProductDetails}>
                  <ThemedText style={styles.productName}>Silk Evening Dress</ThemedText>
                  <View style={styles.ratingContainer}>
                    <IconSymbol name="star.fill" size={12} color="#FFD700" />
                    <ThemedText style={styles.ratingText}>4.5/5</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Top Products
            </ThemedText>
            <TouchableOpacity onPress={handleViewAllProducts}>
              <ThemedText style={[styles.viewAllText, { color: tintColor }]}>
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.productsList}>
            {mockTopProducts.map((product) => (
              <TouchableOpacity key={product.id} style={[styles.productCard, { backgroundColor }]}>
                <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <ThemedText style={styles.productName}>{product.name}</ThemedText>
                  <View style={styles.productStats}>
                    <ThemedText style={[styles.productSales, { color: iconColor }]}>
                      {product.sales} sales
                    </ThemedText>
                    <ThemedText style={styles.productRevenue}>
                      ₦{product.revenue.toLocaleString()}
                    </ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  welcomeSection: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 20,
    fontSize: 20,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Metrics Grid Styles
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  // Orders List Styles
  ordersList: {
    gap: 12,
  },
  orderCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  // Products List Styles
  productsList: {
    gap: 12,
  },
  productCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productSales: {
    fontSize: 14,
  },
  productRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Customer Try-On Styles
  tryOnsList: {
    gap: 12,
  },
  tryOnCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tryOnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInitial: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  customerDetails: {
    flex: 1,
  },
  tryOnCustomerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  tryOnDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  tryOnProductInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tryOnProductDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productPrice: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
