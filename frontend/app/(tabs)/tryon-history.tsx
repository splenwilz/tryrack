/**
 * Try-On History Screen
 * Shows all completed virtual try-ons for the user
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '@/hooks/useAuthQuery';
import { useTryOnHistory } from '@/hooks/useVirtualTryOn';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2; // 2 columns with padding

export default function TryOnHistoryScreen() {
  const router = useRouter();
  const { data: user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCount] = useState(0); // Placeholder for notifications
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const { 
    data: tryons, 
    isLoading,
    isFetching,
    refetch 
  } = useTryOnHistory(user?.id ?? 0);
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: '#ffffff', dark: '#1c1c1e' }, 'background');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSearchPress = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery(''); // Clear search when closing
    }
  };

  const handleNotificationPress = () => {
    console.log('Notifications pressed');
    // TODO: Navigate to notifications
  };

  // Auto-refetch when screen comes into focus (e.g., after creating a new try-on)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Try-Ons screen focused - refetching data...');
      refetch();
    }, [refetch])
  );

  const handleItemPress = (item: any) => {
    // Navigate to full-screen detail view
    router.push({
      pathname: '/tryon-detail',
      params: {
        imageUrl: item.result_image_url,
        createdAt: item.created_at,
        tryonId: item.id.toString(),
      },
    });
  };

  // Filter try-ons based on search query
  const filteredTryons = useMemo(() => {
    if (!tryons) return [];
    if (!searchQuery.trim()) return tryons;
    
    const query = searchQuery.toLowerCase();
    return tryons.filter((item: any) => {
      const category = item.item_details?.category?.toLowerCase() || '';
      const date = formatDate(item.created_at).toLowerCase();
      return category.includes(query) || date.includes(query);
    });
  }, [tryons, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg }]}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.result_image_url }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.cardFooter}>
        <Text style={[styles.dateText, { color: textColor }]} numberOfLines={1}>
          {formatDate(item.created_at)}
        </Text>
        <MaterialIcons name="chevron-right" size={20} color={textColor} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="checkroom" size={64} color="#999" />
      <Text style={[styles.emptyText, { color: textColor }]}>No Try-Ons Yet</Text>
      <Text style={[styles.emptySubtext, { color: '#999' }]}>
        Start trying on items from your wardrobe!
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: tintColor }]}
        onPress={() => router.push('/(tabs)/wardrobe')}
      >
        <Text style={styles.emptyButtonText}>Go to Wardrobe</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !tryons) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader
          title="My Try-Ons"
          onSearchPress={handleSearchPress}
          onNotificationPress={handleNotificationPress}
          notificationCount={notificationCount}
        />
        <View style={[styles.centered, { flex: 1 }]}>
          <ActivityIndicator size="large" color={tintColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Loading your try-ons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader
        title="My Try-Ons"
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        notificationCount={notificationCount}
      />
      
      {/* Search Bar */}
      {showSearch && (
        <View style={[styles.searchContainer, { backgroundColor: cardBg }]}>
          <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search by category or date..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Subtitle with count and loading indicator */}
      <View style={styles.subtitleContainer}>
        <Text style={[styles.subtitle, { color: '#999' }]}>
          {filteredTryons.length || 0} {filteredTryons.length === 1 ? 'result' : 'results'}
          {searchQuery.trim() && ` for "${searchQuery}"`}
        </Text>
        {isFetching && !refreshing && (
          <ActivityIndicator size="small" color={tintColor} style={styles.subtitleLoader} />
        )}
      </View>

      {/* Grid */}
      <FlatList
        data={filteredTryons}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  subtitleLoader: {
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: ITEM_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: ITEM_WIDTH * 1.4,
    backgroundColor: '#f0f0f0',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  dateText: {
    fontSize: 14,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

