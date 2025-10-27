import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Analytics data interfaces
interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface ProductPerformance {
  id: string;
  name: string;
  imageUrl: string;
  sales: number;
  revenue: number;
  views: number;
  conversionRate: number;
  rating: number;
}

interface CustomerInsight {
  segment: string;
  count: number;
  percentage: number;
  avgOrderValue: number;
  color: string;
}

interface RevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

// Mock analytics data
const mockSalesData: SalesData[] = [
  { period: 'Jan', revenue: 1200000, orders: 45, customers: 38 },
  { period: 'Feb', revenue: 1350000, orders: 52, customers: 42 },
  { period: 'Mar', revenue: 1180000, orders: 48, customers: 40 },
  { period: 'Apr', revenue: 1420000, orders: 58, customers: 45 },
  { period: 'May', revenue: 1680000, orders: 67, customers: 52 },
  { period: 'Jun', revenue: 1950000, orders: 78, customers: 61 },
];

const mockProductPerformance: ProductPerformance[] = [
  {
    id: '1',
    name: 'Designer Blazer',
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=100&h=100&fit=crop',
    sales: 45,
    revenue: 2025000,
    views: 1200,
    conversionRate: 3.75,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Silk Evening Dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=100&h=100&fit=crop',
    sales: 32,
    revenue: 2400000,
    views: 980,
    conversionRate: 3.27,
    rating: 4.9
  },
  {
    id: '3',
    name: 'Summer Maxi Dress',
    imageUrl: 'https://images.unsplash.com/photo-1594736797933-d0c29b8b0b8c?w=100&h=100&fit=crop',
    sales: 28,
    revenue: 980000,
    views: 750,
    conversionRate: 3.73,
    rating: 4.6
  },
  {
    id: '4',
    name: 'Casual Denim Jacket',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=100&h=100&fit=crop',
    sales: 22,
    revenue: 616000,
    views: 650,
    conversionRate: 3.38,
    rating: 4.4
  }
];

const mockCustomerInsights: CustomerInsight[] = [
  { segment: 'New Customers', count: 45, percentage: 35, avgOrderValue: 18500, color: '#4CAF50' },
  { segment: 'Returning Customers', count: 52, percentage: 40, avgOrderValue: 28500, color: '#2196F3' },
  { segment: 'VIP Customers', count: 31, percentage: 25, avgOrderValue: 45000, color: '#FF9800' },
];

const mockRevenueBreakdown: RevenueBreakdown[] = [
  { category: 'Dresses', amount: 2400000, percentage: 40, color: '#E91E63' },
  { category: 'Outerwear', amount: 1800000, percentage: 30, color: '#9C27B0' },
  { category: 'Tops', amount: 1200000, percentage: 20, color: '#3F51B5' },
  { category: 'Accessories', amount: 600000, percentage: 10, color: '#00BCD4' },
];

/**
 * Boutique Analytics Screen
 * Comprehensive analytics dashboard with sales, product, and customer insights
 * Based on blueprint requirements for boutique performance tracking
 */
export default function BoutiqueAnalyticsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const [selectedPeriod, setSelectedPeriod] = React.useState<string>('6m');

  const handleBackPress = () => {
    console.log('Navigate back to dashboard');
  };

  const handleSearchPress = () => {
    console.log('Search analytics');
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed');
  };

  const getTotalRevenue = () => {
    return mockSalesData.reduce((sum, data) => sum + data.revenue, 0);
  };

  const getTotalOrders = () => {
    return mockSalesData.reduce((sum, data) => sum + data.orders, 0);
  };

  const getTotalCustomers = () => {
    return mockSalesData.reduce((sum, data) => sum + data.customers, 0);
  };

  const getAverageOrderValue = () => {
    const totalRevenue = getTotalRevenue();
    const totalOrders = getTotalOrders();
    return totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  };

  const getGrowthRate = () => {
    const firstMonth = mockSalesData[0].revenue;
    const lastMonth = mockSalesData[mockSalesData.length - 1].revenue;
    return ((lastMonth - firstMonth) / firstMonth) * 100;
  };

  const periodOptions = [
    { key: '1m', label: '1 Month' },
    { key: '3m', label: '3 Months' },
    { key: '6m', label: '6 Months' },
    { key: '1y', label: '1 Year' },
  ];

  const renderMetricCard = (title: string, value: string, change: number, icon: string) => (
    <View style={[styles.metricCard, { backgroundColor }]}>
      <View style={styles.metricHeader}>
        <IconSymbol 
          name={icon as 'dollarsign' | 'bag.fill' | 'person.fill' | 'chart.bar.fill'} 
          size={20} 
          color={tintColor} 
        />
        <View style={styles.changeContainer}>
          <IconSymbol 
            name={change >= 0 ? 'arrow.up' : 'arrow.down'} 
            size={12} 
            color={change >= 0 ? '#4CAF50' : '#FF5722'} 
          />
          <ThemedText style={[styles.changeText, { color: change >= 0 ? '#4CAF50' : '#FF5722' }]}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
          </ThemedText>
        </View>
      </View>
      <ThemedText style={styles.metricValue}>{value}</ThemedText>
      <ThemedText style={[styles.metricTitle, { color: iconColor }]}>{title}</ThemedText>
    </View>
  );

  const renderSalesChart = () => {
    const maxRevenue = Math.max(...mockSalesData.map(d => d.revenue));
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <ThemedText type="subtitle" style={styles.chartTitle}>
            Sales Trend
          </ThemedText>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: tintColor }]} />
              <ThemedText style={[styles.legendText, { color: iconColor }]}>Revenue</ThemedText>
            </View>
          </View>
        </View>
        
        <View style={styles.chartArea}>
          <View style={styles.chartBars}>
            {mockSalesData.map((data) => {
              const height = (data.revenue / maxRevenue) * 120;
              return (
                <View key={data.period} style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: height,
                        backgroundColor: tintColor,
                        opacity: 0.8
                      }
                    ]} 
                  />
                  <ThemedText style={[styles.barLabel, { color: iconColor }]}>
                    {data.period}
                  </ThemedText>
                  <ThemedText style={[styles.barValue, { color: iconColor }]}>
                    ₦{(data.revenue / 1000000).toFixed(1)}M
                  </ThemedText>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderProductPerformance = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Top Performing Products
        </ThemedText>
        <TouchableOpacity>
          <ThemedText style={[styles.viewAllText, { color: tintColor }]}>
            View All
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
        {mockProductPerformance.map((product) => (
          <View key={product.id} style={[styles.productCard, { backgroundColor }]}>
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <ThemedText style={styles.productName} numberOfLines={2}>
                {product.name}
              </ThemedText>
              <View style={styles.productStats}>
                <View style={styles.statRow}>
                  <ThemedText style={[styles.statLabel, { color: iconColor }]}>Sales:</ThemedText>
                  <ThemedText style={styles.statValue}>{product.sales}</ThemedText>
                </View>
                <View style={styles.statRow}>
                  <ThemedText style={[styles.statLabel, { color: iconColor }]}>Revenue:</ThemedText>
                  <ThemedText style={styles.statValue}>₦{(product.revenue / 1000).toFixed(0)}k</ThemedText>
                </View>
                <View style={styles.statRow}>
                  <ThemedText style={[styles.statLabel, { color: iconColor }]}>Conversion:</ThemedText>
                  <ThemedText style={styles.statValue}>{product.conversionRate}%</ThemedText>
                </View>
                <View style={styles.statRow}>
                  <IconSymbol name="star.fill" size={12} color="#FFD700" />
                  <ThemedText style={styles.statValue}>{product.rating}</ThemedText>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderCustomerInsights = () => (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Customer Segments
      </ThemedText>
      
      <View style={styles.insightsContainer}>
        {mockCustomerInsights.map((insight) => (
          <View key={insight.segment} style={[styles.insightCard, { backgroundColor }]}>
            <View style={styles.insightHeader}>
              <View style={[styles.segmentDot, { backgroundColor: insight.color }]} />
              <ThemedText style={styles.segmentName}>{insight.segment}</ThemedText>
            </View>
            <ThemedText style={styles.segmentCount}>{insight.count} customers</ThemedText>
            <ThemedText style={[styles.segmentPercentage, { color: iconColor }]}>
              {insight.percentage}% of total
            </ThemedText>
            <ThemedText style={[styles.segmentAOV, { color: iconColor }]}>
              Avg Order: ₦{insight.avgOrderValue.toLocaleString()}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRevenueBreakdown = () => (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        Revenue by Category
      </ThemedText>
      
      <View style={styles.breakdownContainer}>
        {mockRevenueBreakdown.map((item) => (
          <View key={item.category} style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
              <ThemedText style={styles.categoryName}>{item.category}</ThemedText>
              <ThemedText style={styles.categoryPercentage}>{item.percentage}%</ThemedText>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${item.percentage}%`,
                    backgroundColor: item.color 
                  }
                ]} 
              />
            </View>
            <ThemedText style={[styles.categoryAmount, { color: iconColor }]}>
              ₦{item.amount.toLocaleString()}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Analytics"
        showBackButton={true}
        onBackPress={handleBackPress}
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        notificationCount={3}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period and Metric Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodFilters}
          >
            {periodOptions.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.filterTab,
                  { backgroundColor: selectedPeriod === period.key ? tintColor : backgroundColor },
                  selectedPeriod === period.key && styles.activeFilterTab
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <ThemedText 
                  style={[
                    styles.filterText,
                    { color: selectedPeriod === period.key ? 'white' : iconColor }
                  ]}
                >
                  {period.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Key Performance Indicators
          </ThemedText>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'Total Revenue',
              `₦${(getTotalRevenue() / 1000000).toFixed(1)}M`,
              getGrowthRate(),
              'dollarsign'
            )}
            {renderMetricCard(
              'Total Orders',
              getTotalOrders().toString(),
              12.5,
              'bag.fill'
            )}
            {renderMetricCard(
              'Total Customers',
              getTotalCustomers().toString(),
              8.3,
              'person.fill'
            )}
            {renderMetricCard(
              'Avg Order Value',
              `₦${getAverageOrderValue().toLocaleString()}`,
              5.7,
              'chart.bar.fill'
            )}
          </View>
        </View>

        {/* Sales Chart */}
        {renderSalesChart()}

        {/* Product Performance */}
        {renderProductPerformance()}

        {/* Customer Insights */}
        {renderCustomerInsights()}

        {/* Revenue Breakdown */}
        {renderRevenueBreakdown()}
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
  filtersContainer: {
    paddingVertical: 16,
  },
  periodFilters: {
    paddingRight: 20,
  },
  filterTab: {
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
  },
  metricsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
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
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
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
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Chart Styles
  chartContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  chartLegend: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    opacity: 0.7,
  },
  chartArea: {
    height: 160,
    justifyContent: 'flex-end',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    opacity: 0.7,
  },
  // Product Performance Styles
  productsScroll: {
    paddingRight: 20,
  },
  productCard: {
    width: 140,
    marginRight: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  productStats: {
    gap: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Customer Insights Styles
  insightsContainer: {
    gap: 12,
  },
  insightCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  segmentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  segmentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  segmentCount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  segmentPercentage: {
    fontSize: 14,
    marginBottom: 4,
  },
  segmentAOV: {
    fontSize: 12,
    opacity: 0.7,
  },
  // Revenue Breakdown Styles
  breakdownContainer: {
    gap: 16,
  },
  breakdownItem: {
    marginBottom: 8,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  categoryPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryAmount: {
    fontSize: 12,
    opacity: 0.7,
  },
});