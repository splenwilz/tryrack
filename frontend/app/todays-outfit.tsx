import { useState, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomHeader } from '@/components/home/CustomHeader';
import { router } from 'expo-router';
import { useUser } from '@/hooks/useAuthQuery';
import { useWardrobeItems, useBatchUpdateStatus } from '@/hooks/useWardrobe';
import type { WardrobeItem } from '@/hooks/useWardrobe';

/**
 * Today's Outfit Screen
 * Quick selection interface for users to mark what they're wearing today
 */
export default function TodaysOutfitScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  
  const { data: user } = useUser();
  const userId = user?.id ?? 0;
  
  // Fetch clean wardrobe items only
  // Use cached data when available (React Query provides cached data even while refetching)
  // Reference: https://tanstack.com/query/latest/docs/framework/react/guides/caching
  const { data: apiItems, isLoading, isFetching, error } = useWardrobeItems(userId, { status: 'clean' });
  const batchUpdateMutation = useBatchUpdateStatus();
  
  // Use cached data if available, fallback to empty array only when we know there's no data
  // Memoize to prevent unnecessary re-renders
  const items = useMemo(() => apiItems ?? [], [apiItems]);
  
  // Track selected item IDs
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());
  
  // Toggle item selection
  const toggleItemSelection = (itemId: number) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };
  
  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, WardrobeItem[]> = {};
    
    items.forEach(item => {
      if (item.status === 'clean') {
        const category = item.category.toLowerCase().trim();
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
      }
    });
    
    // Category display order
    const categoryOrder = ['top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessories'];
    const sortedCategories = Object.keys(groups).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    
    return { groups, sortedCategories };
  }, [items]);
  
  // Selected items summary
  const selectedItems = useMemo(() => {
    return items.filter(item => selectedItemIds.has(item.id));
  }, [items, selectedItemIds]);
  
  // Handle marking items as worn
  const handleMarkAsWorn = async () => {
    if (selectedItemIds.size === 0) {
      Alert.alert('No Items Selected', 'Please select at least one item to mark as worn.');
      return;
    }

    // Show smart prompt: Ask if items should be marked dirty too
    const itemCount = selectedItemIds.size;
    const selectedItemsArray = Array.from(selectedItemIds).map(id => 
      items.find(item => item.id === id)
    ).filter(Boolean);
    
    const itemText = itemCount === 1 && selectedItemsArray[0]
      ? `"${selectedItemsArray[0].title}"`
      : `${itemCount} items`;
    
    Alert.alert(
      'Mark as Worn',
      `Did you wear ${itemText} today? Mark as dirty too?`,
      [
        {
          text: 'Worn Only',
          style: 'default',
          onPress: async () => {
            try {
              const itemIds = Array.from(selectedItemIds);
              const result = await batchUpdateMutation.mutateAsync({
                userId,
                itemIds,
                status: 'worn',
              });

              if (result.errors && result.errors.length > 0) {
                Alert.alert(
                  'Partial Success',
                  `Marked ${result.total_updated} item(s) as worn. Some items failed to update.`,
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              } else {
                Alert.alert(
                  'Success!',
                  `Marked ${result.total_updated} item(s) as worn today.`,
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              }
            } catch (error) {
              console.error('Failed to mark items as worn:', error);
              Alert.alert('Error', 'Failed to update items. Please try again.');
            }
          },
        },
        {
          text: 'Worn + Dirty',
          style: 'default',
          onPress: async () => {
            try {
              const itemIds = Array.from(selectedItemIds);
              
              // First mark as worn (tracks wear_count), then mark as dirty
              const wornResult = await batchUpdateMutation.mutateAsync({
                userId,
                itemIds,
                status: 'worn',
              });
              
              // Then mark as dirty
              const dirtyResult = await batchUpdateMutation.mutateAsync({
                userId,
                itemIds,
                status: 'dirty',
              });

              const totalUpdated = Math.min(wornResult.total_updated, dirtyResult.total_updated);
              const hasErrors = (wornResult.errors && wornResult.errors.length > 0) ||
                               (dirtyResult.errors && dirtyResult.errors.length > 0);

              if (hasErrors) {
                Alert.alert(
                  'Partial Success',
                  `Marked ${totalUpdated} item(s) as worn and dirty. Some items failed to update.`,
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              } else {
                Alert.alert(
                  'Success!',
                  `Marked ${totalUpdated} item(s) as worn and dirty today.`,
                  [{ text: 'OK', onPress: () => router.back() }]
                );
              }
            } catch (error) {
              console.error('Failed to mark items as worn and dirty:', error);
              Alert.alert('Error', 'Failed to update items. Please try again.');
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };
  
  // Show loading state ONLY if we have no cached data AND it's loading
  // If we have cached data, show it immediately even while refetching
  // Reference: https://tanstack.com/query/latest/docs/framework/react/guides/displaying-cached-data
  const showLoadingState = isLoading && !apiItems;
  
  // Show error state (but still show cached data if available)
  const showErrorState = error && !apiItems;
  
  // Show loading state only when there's no cached data
  if (showLoadingState) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="Today's Outfit" showBackButton={true} onBackPress={() => router.back()} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading your wardrobe...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }
  
  // Show error state only when there's no cached data to show
  if (showErrorState) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="Today's Outfit" showBackButton={true} onBackPress={() => router.back()} />
        <View style={styles.centerContent}>
          <ThemedText style={styles.errorText}>Error loading wardrobe</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: tintColor }]}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.buttonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Show empty state ONLY if we have fetched items AND there are none AND we're not loading/fetching
  // This ensures we don't flash empty state while data is being fetched
  // Check Array.isArray(apiItems) to ensure data has actually been fetched (not just undefined)
  const hasFetchedItems = Array.isArray(apiItems);
  if (hasFetchedItems && items.length === 0 && !isLoading && !isFetching) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="Today's Outfit" showBackButton={true} onBackPress={() => router.back()} />
        <View style={styles.centerContent}>
          <IconSymbol name="tshirt" size={64} color={textColor} style={{ opacity: 0.3, marginBottom: 16 }} />
          <ThemedText type="title" style={styles.emptyTitle}>No Clean Items</ThemedText>
          <ThemedText style={styles.emptyText}>
            You don&apos;t have any clean items in your wardrobe. Add items or mark existing items as clean to get started.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader title="Select Today&apos;s Outfit" showBackButton={true} onBackPress={() => router.back()} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Show subtle loading indicator if refetching in background */}
        {isFetching && !isLoading && items.length > 0 && (
          <View style={styles.refetchIndicator}>
            <ActivityIndicator size="small" color={tintColor} />
            <ThemedText style={styles.refetchText}>Updating...</ThemedText>
          </View>
        )}
        
        {/* Summary Section */}
        {selectedItems.length > 0 && (
          <View style={[styles.summaryCard, { backgroundColor }]}>
            <View style={styles.summaryHeader}>
              <ThemedText type="subtitle" style={styles.summaryTitle}>
                Selected Items ({selectedItems.length})
              </ThemedText>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.summaryScroll}>
              {selectedItems.map(item => (
                <View key={item.id} style={[styles.summaryItem, { backgroundColor }]}>
                  <Image
                    source={{ uri: item.image_clean || item.image_original || 'https://via.placeholder.com/80' }}
                    style={styles.summaryImage}
                  />
                  <ThemedText style={styles.summaryItemTitle} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <ThemedText style={styles.instructionsText}>
            Select the items you&apos;re wearing today. Tap items to select or deselect them.
          </ThemedText>
        </View>
        
        {/* Items by Category */}
        {groupedItems.sortedCategories.map(category => {
          const items = groupedItems.groups[category];
          if (items.length === 0) return null;
          
          return (
            <View key={category} style={styles.categorySection}>
              <ThemedText type="subtitle" style={styles.categoryTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)} ({items.length})
              </ThemedText>
              <View style={styles.itemsGrid}>
                {items.map(item => {
                  const isSelected = selectedItemIds.has(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.itemCard,
                        { backgroundColor },
                        isSelected && { borderColor: tintColor, borderWidth: 2 },
                      ]}
                      onPress={() => toggleItemSelection(item.id)}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={{ uri: item.image_clean || item.image_original || 'https://via.placeholder.com/120' }}
                        style={styles.itemImage}
                      />
                      {isSelected && (
                        <View style={[styles.selectedBadge, { backgroundColor: tintColor }]}>
                          <IconSymbol name="checkmark" size={16} color="white" />
                        </View>
                      )}
                      <ThemedText style={styles.itemTitle} numberOfLines={2}>
                        {item.title}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
      
      {/* Fixed CTA Button */}
      <View style={[styles.footer, { backgroundColor }]}>
        <TouchableOpacity
          style={[
            styles.ctaButton,
            { backgroundColor: tintColor },
            (selectedItemIds.size === 0 || batchUpdateMutation.isPending) && styles.ctaButtonDisabled,
          ]}
          onPress={handleMarkAsWorn}
          disabled={selectedItemIds.size === 0 || batchUpdateMutation.isPending}
        >
          {batchUpdateMutation.isPending ? (
            <>
              <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
              <ThemedText style={styles.ctaButtonText}>Updating...</ThemedText>
            </>
          ) : (
            <>
              <IconSymbol name="checkmark.circle.fill" size={20} color="white" />
              <ThemedText style={styles.ctaButtonText}>
                Mark {selectedItemIds.size > 0 ? `${selectedItemIds.size} ` : ''}as Worn Today
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  summaryCard: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryScroll: {
    marginHorizontal: -4,
  },
  summaryItem: {
    width: 80,
    marginRight: 12,
    alignItems: 'center',
  },
  summaryImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  summaryItemTitle: {
    fontSize: 11,
    textAlign: 'center',
  },
  instructionsCard: {
    marginTop:20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  instructionsText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  itemCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 12,
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Background refetch indicator
  refetchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  refetchText: {
    fontSize: 12,
    opacity: 0.6,
  },
});

