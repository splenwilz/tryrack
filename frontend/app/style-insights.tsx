import React, { useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useStyleInsights } from '@/hooks/useStyleInsights';
import type { StyleInsights } from '@/hooks/useStyleInsights';

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

// Transform API data into UI format
function transformInsightsData(data: StyleInsights | undefined): StyleInsight[] {
  if (!data) return [];
  
  const insights: StyleInsight[] = [];
  
  // Style Preferences - get the highest percentage style
  const stylePreferences = data.style_preferences || {};
  const topStyle = Object.entries(stylePreferences)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0];
  
  if (topStyle) {
    const [styleName, percentage] = topStyle;
    insights.push({
      id: 'style-preferences',
      title: 'Style Preferences',
      description: `${styleName.charAt(0).toUpperCase() + styleName.slice(1)} style is your favorite`,
      value: `${Math.round(percentage as number)}%`,
      trend: 'stable',
      icon: 'heart.fill',
      category: 'preferences',
      detailedDescription: `Your style leans heavily towards ${styleName} with ${percentage}% of your wardrobe items matching this aesthetic.`,
      tips: getStyleTips(styleName)
    });
  }
  
  // Color Palette - top color
  const colorPalette = data.color_palette || [];
  if (colorPalette.length > 0) {
    const topColor = colorPalette[0];
    const secondColor = colorPalette[1];
    const thirdColor = colorPalette[2];
    
    let description = `${topColor.color} is your most worn color`;
    let detailedDescription = `${topColor.color} dominates your wardrobe at ${topColor.percentage}%`;
    
    if (secondColor) {
      description += ` (${secondColor.color} ${secondColor.percentage}%)`;
      detailedDescription += `, followed by ${secondColor.color} (${secondColor.percentage}%)`;
    }
    if (thirdColor) {
      detailedDescription += ` and ${thirdColor.color} (${thirdColor.percentage}%)`;
    }
    detailedDescription += '. This creates a sophisticated, timeless look.';
    
    insights.push({
      id: 'color-palette',
      title: 'Color Palette',
      description,
      value: `${Math.round(topColor.percentage)}%`,
      trend: 'stable',
      icon: 'paintpalette',
      category: 'color',
      detailedDescription,
      tips: [
        'Add more colorful accessories',
        'Try earth tones for variety',
        'Consider seasonal color trends'
      ]
    });
  }
  
  // Style Evolution
  if (data.style_evolution?.changes) {
    const changes = data.style_evolution.changes;
    const significantChanges = Object.entries(changes)
      .filter(([, change]) => Math.abs(change.change) >= 10)
      .sort(([, a], [, b]) => Math.abs(b.change) - Math.abs(a.change));
    
    if (significantChanges.length > 0) {
      const [styleName, changeData] = significantChanges[0];
      const trend = changeData.trend === 'up' ? 'up' : changeData.trend === 'down' ? 'down' : 'stable';
      const changeValue = Math.abs(changeData.change);
      
      insights.push({
        id: 'style-evolution',
        title: 'Style Evolution',
        description: `Your ${styleName} style has ${trend === 'up' ? 'grown' : trend === 'down' ? 'decreased' : 'stayed stable'} ${changeValue}% this month`,
        value: trend === 'up' ? `+${Math.round(changeValue)}%` : trend === 'down' ? `-${Math.round(changeValue)}%` : '0%',
        trend,
        icon: 'arrow.up',
        category: 'evolution',
        detailedDescription: `Your fashion sense has ${trend === 'up' ? 'significantly improved' : trend === 'down' ? 'shifted' : 'remained consistent'} this month. You've been experimenting with new combinations and stepping out of your comfort zone.`,
        tips: [
          'Try mixing different textures',
          'Experiment with color combinations',
          'Accessorize more frequently'
        ]
      });
    }
  }
  
  // Formality Profile
  if (data.average_formality > 0) {
    const formalityLevel = data.average_formality >= 70 ? 'formal' : data.average_formality >= 40 ? 'casual' : 'very casual';
    insights.push({
      id: 'formality-profile',
      title: 'Formality Profile',
      description: `Your wardrobe is ${formalityLevel}`,
      value: `${Math.round(data.average_formality)}%`,
      trend: 'stable',
      icon: 'briefcase.fill',
      category: 'preferences',
      detailedDescription: `Your average formality score is ${Math.round(data.average_formality)}%, indicating a ${formalityLevel} style preference.`,
      tips: [
        data.average_formality >= 70 ? 'Try adding some casual pieces' : 'Add more formal items for versatility',
        'Balance professional and personal style',
        'Consider occasion-appropriate dressing'
      ]
    });
  }
  
  return insights;
}

// Helper function for style-specific tips
function getStyleTips(styleName: string): string[] {
  const tipsMap: Record<string, string[]> = {
    minimalist: [
      'Invest in quality basics',
      'Focus on fit over trends',
      'Build a capsule wardrobe'
    ],
    formal: [
      'Add statement accessories',
      'Experiment with casual looks',
      'Balance professional and personal style'
    ],
    casual: [
      'Add versatile pieces',
      'Try mixing casual and formal',
      'Build a cohesive wardrobe'
    ],
    elegant: [
      'Focus on quality materials',
      'Invest in timeless pieces',
      'Perfect your fit'
    ]
  };
  
  return tipsMap[styleName] || [
    'Experiment with new combinations',
    'Try different styles',
    'Build a cohesive wardrobe'
  ];
}

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
  
  // Fetch style insights from API
  const { data: insightsData, isLoading, error } = useStyleInsights();
  
  // Transform API data to UI format
  const styleInsights = useMemo(() => {
    if (__DEV__) {
      console.log('🔄 Transforming insights data:', insightsData);
    }
    const transformed = transformInsightsData(insightsData);
    if (__DEV__) {
      console.log('✅ Transformed insights:', transformed);
    }
    return transformed;
  }, [insightsData]);
  
  const filteredInsights = selectedCategory === 'all' 
    ? styleInsights 
    : styleInsights.filter(insight => insight.category === selectedCategory);

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

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={styles.loadingText}>Analyzing your style...</ThemedText>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>
              Unable to load style insights. Please try again later.
            </ThemedText>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredInsights.length === 0 && (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No style insights available yet. Add items to your wardrobe to see your style analysis.
            </ThemedText>
          </View>
        )}

        {/* Insights List */}
        {!isLoading && !error && filteredInsights.length > 0 && (
          <View style={styles.insightsList}>
            {filteredInsights.map((insight) => (
              <StyleInsightCard key={insight.id} insight={insight} />
            ))}
          </View>
        )}

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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    opacity: 0.7,
  },
  errorContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});
