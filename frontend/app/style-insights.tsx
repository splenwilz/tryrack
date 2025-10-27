import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';

// Style Insight interface
interface StyleInsight {
  id: string;
  title: string;
  description: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  category: 'evolution' | 'color' | 'sustainability' | 'preferences';
  detailedDescription: string;
  tips: string[];
}

// Extended mock data for comprehensive style insights
const mockStyleInsights: StyleInsight[] = [
  {
    id: '1',
    title: 'Style Evolution',
    description: 'Your style has evolved 23% this month',
    value: '+23%',
    trend: 'up',
    icon: 'arrow.up',
    category: 'evolution',
    detailedDescription: 'Your fashion sense has significantly improved this month. You\'ve been experimenting with new combinations and stepping out of your comfort zone.',
    tips: [
      'Try mixing different textures',
      'Experiment with color combinations',
      'Accessorize more frequently'
    ]
  },
  {
    id: '2',
    title: 'Color Palette',
    description: 'Black is your most worn color',
    value: '42%',
    trend: 'stable',
    icon: 'paintpalette',
    category: 'color',
    detailedDescription: 'Black dominates your wardrobe at 42%, followed by navy (18%) and white (15%). This creates a sophisticated, timeless look.',
    tips: [
      'Add more colorful accessories',
      'Try earth tones for variety',
      'Consider seasonal color trends'
    ]
  },
  {
    id: '3',
    title: 'Sustainability',
    description: 'You\'re 15% more sustainable than last month',
    value: '85%',
    trend: 'up',
    icon: 'leaf',
    category: 'sustainability',
    detailedDescription: 'Your sustainable fashion choices have improved significantly. You\'re choosing quality over quantity and supporting eco-friendly brands.',
    tips: [
      'Continue buying second-hand items',
      'Support local sustainable brands',
      'Learn about fabric sustainability'
    ]
  },
  {
    id: '5',
    title: 'Style Preferences',
    description: 'Minimalist style is your favorite',
    value: '78%',
    trend: 'stable',
    icon: 'heart.fill',
    category: 'preferences',
    detailedDescription: 'Your style leans heavily towards minimalism with clean lines, neutral colors, and simple silhouettes.',
    tips: [
      'Invest in quality basics',
      'Focus on fit over trends',
      'Build a capsule wardrobe'
    ]
  },
  {
    id: '6',
    title: 'Occasion Dressing',
    description: 'Work outfits are your strength',
    value: '92%',
    trend: 'up',
    icon: 'briefcase.fill',
    category: 'preferences',
    detailedDescription: 'You excel at professional dressing with a 92% success rate for work-appropriate outfits.',
    tips: [
      'Add more statement pieces',
      'Experiment with casual looks',
      'Balance professional and personal style'
    ]
  }
];

// Style Insight Card Component
const StyleInsightCard: React.FC<{ insight: StyleInsight }> = ({ insight }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  
  const getTrendColor = () => {
    switch (insight.trend) {
      case 'up': return '#4CAF50';
      case 'down': return '#FF5722';
      default: return tintColor;
    }
  };

  return (
    <View style={[styles.insightCard, { backgroundColor }]}>
      <View style={styles.insightHeader}>
        <View style={styles.insightIconContainer}>
          <IconSymbol 
            name={insight.icon as 'arrow.up' | 'paintpalette' | 'leaf' | 'heart.fill' | 'briefcase.fill'} 
            size={24} 
            color={getTrendColor()} 
          />
        </View>
        <View style={styles.insightTitleContainer}>
          <ThemedText style={styles.insightTitle}>{insight.title}</ThemedText>
          <ThemedText style={[styles.insightValue, { color: getTrendColor() }]}>
            {insight.value}
          </ThemedText>
        </View>
      </View>
      
      <ThemedText style={[styles.insightDescription, { color: iconColor }]}>
        {insight.description}
      </ThemedText>
      
      <ThemedText style={styles.detailedDescription}>
        {insight.detailedDescription}
      </ThemedText>
      
      <View style={styles.tipsContainer}>
        <ThemedText style={styles.tipsTitle}>Tips:</ThemedText>
        {insight.tips.map((tip) => (
          <View key={tip} style={styles.tipItem}>
            <IconSymbol name="plus" size={12} color={tintColor} />
            <ThemedText style={styles.tipText}>{tip}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};

// Category Filter Component
const CategoryFilter: React.FC<{ 
  selectedCategory: string; 
  onCategoryChange: (category: string) => void;
}> = ({ selectedCategory, onCategoryChange }) => {
  const tintColor = useThemeColor({}, 'tint');
  
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'evolution', name: 'Evolution' },
    { id: 'color', name: 'Color' },
    { id: 'sustainability', name: 'Sustainability' },
    { id: 'preferences', name: 'Preferences' }
  ];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScroll}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.filterButton,
            { 
              backgroundColor: selectedCategory === category.id ? tintColor : 'transparent',
              borderColor: tintColor
            }
          ]}
          onPress={() => onCategoryChange(category.id)}
        >
          <ThemedText 
            style={[
              styles.filterButtonText,
              { color: selectedCategory === category.id ? 'white' : tintColor }
            ]}
          >
            {category.name}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

/**
 * Style Insights Screen Component
 * Comprehensive view of all style analytics and insights
 */
export default function StyleInsightsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  
  const filteredInsights = selectedCategory === 'all' 
    ? mockStyleInsights 
    : mockStyleInsights.filter(insight => insight.category === selectedCategory);

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="Style Insights"
        showBackButton={true}
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <ThemedText type="title" style={styles.headerTitle}>
            Your Style Journey
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Discover how your fashion choices evolve and get personalized tips to enhance your style.
          </ThemedText>
        </View>

        {/* Category Filter */}
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Insights List */}
        <View style={styles.insightsList}>
          {filteredInsights.map((insight) => (
            <StyleInsightCard key={insight.id} insight={insight} />
          ))}
        </View>

        {/* Summary Section */}
        <View style={[styles.summaryCard, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.summaryTitle}>
            Style Summary
          </ThemedText>
          <ThemedText style={styles.summaryText}>
            You&apos;re making great progress in your style journey! Keep experimenting with new combinations and don&apos;t be afraid to step out of your comfort zone.
          </ThemedText>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: tintColor }]}
            onPress={() => router.push('/(tabs)/wardrobe')}
          >
            <IconSymbol name="plus" size={16} color="white" />
            <ThemedText style={styles.actionButtonText}>Add More Items</ThemedText>
          </TouchableOpacity>
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
  insightsList: {
    paddingVertical: 16,
  },
  insightCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  insightTitleContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  insightDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  detailedDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.8,
  },
  tipsContainer: {
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    marginLeft: 8,
    opacity: 0.8,
  },
  summaryCard: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
