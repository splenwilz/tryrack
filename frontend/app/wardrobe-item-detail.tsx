import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router, useLocalSearchParams } from 'expo-router';
import { useWardrobeItem, useDeleteWardrobeItem, useUpdateWardrobeItemStatus } from '@/hooks/useWardrobe';
import { useUser } from '@/hooks/useAuthQuery';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');

/**
 * Wardrobe Item Detail Screen
 * Comprehensive view of a single wardrobe item with full actions
 */
export default function WardrobeItemDetailScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'tabIconDefault');
  const textColor = useThemeColor({}, 'text');
  
  const { itemId } = useLocalSearchParams<{ itemId: string }>();
  const { data: user, isLoading: isUserLoading } = useUser();
  const userId = user?.id || 0;
  const itemIdNum = itemId ? parseInt(itemId) : 0;
  
  // Use cached data when available (React Query provides cached data even while refetching)
  // Reference: https://tanstack.com/query/latest/docs/framework/react/guides/caching
  const { data: item, isLoading: isItemLoading, isFetching, error } = useWardrobeItem(itemIdNum, userId);
  const deleteMutation = useDeleteWardrobeItem();
  const updateStatusMutation = useUpdateWardrobeItemStatus();
  
  const handleBackPress = () => {
    router.back();
  };

  const handleTryVirtually = () => {
    if (!item) return;
    
    const itemData = {
      id: item.id.toString(),
      title: item.title,
      category: item.category,
      imageUrl: item.image_original || item.image_clean || '',
      colors: item.colors || [],
      tags: item.tags || [],
    };

    router.push({
      pathname: '/virtual-tryon',
      params: {
        itemId: item.id.toString(),
        itemType: 'wardrobe',
        itemData: JSON.stringify(itemData),
      }
    });
  };

  const handleMarkAsWorn = async () => {
    if (!item) return;
    
    // Show smart prompt: Ask if item should be marked dirty too
    Alert.alert(
      'Mark as Worn',
      `Did you wear "${item.title}" today? Mark as dirty too?`,
      [
        {
          text: 'Worn Only',
          style: 'default',
          onPress: async () => {
            try {
              await updateStatusMutation.mutateAsync({ itemId: item.id, userId, status: 'worn' });
              Alert.alert('Updated', `"${item.title}" marked as worn`);
            } catch {
              Alert.alert('Error', 'Failed to update status. Please try again.');
            }
          },
        },
        {
          text: 'Worn + Dirty',
          style: 'default',
          onPress: async () => {
            try {
              // Mark as worn first (tracks wear_count), then mark as dirty
              await updateStatusMutation.mutateAsync({ itemId: item.id, userId, status: 'worn' });
              await updateStatusMutation.mutateAsync({ itemId: item.id, userId, status: 'dirty' });
              Alert.alert('Updated', `"${item.title}" marked as worn and dirty`);
            } catch {
              Alert.alert('Error', 'Failed to update status. Please try again.');
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

  const handleMarkAsClean = async () => {
    if (!item) return;
    try {
      await updateStatusMutation.mutateAsync({ itemId: item.id, userId, status: 'clean' });
      Alert.alert('Updated', `"${item.title}" marked as clean`);
    } catch {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  const handleMarkAsDirty = async () => {
    if (!item) return;
    try {
      await updateStatusMutation.mutateAsync({ itemId: item.id, userId, status: 'dirty' });
      Alert.alert('Updated', `"${item.title}" marked as dirty. Mark as clean after washing.`);
    } catch {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  // Helper to format last worn date
  const formatLastWorn = (lastWornAt?: string): string => {
    if (!lastWornAt) return 'Never worn';
    try {
      const lastWorn = new Date(lastWornAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastWorn.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
      }
      if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} ${months === 1 ? 'month' : 'months'} ago`;
      }
      const years = Math.floor(diffDays / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    } catch {
      return 'Never worn';
    }
  };

  const handleEditItem = () => {
    if (!item) return;
    router.push(`/add-item?itemId=${item.id}`);
  };

  const handleDeleteItem = () => {
    if (!item) return;
    
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({
                itemId: item.id,
                userId: userId,
              });
              Alert.alert('Success', 'Item deleted successfully');
              router.back();
            } catch (error) {
              console.error('Failed to delete item:', error);
              Alert.alert('Error', 'Failed to delete item. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Show loading state ONLY if we have no cached data AND it's loading
  // If we have cached data, show it immediately even while refetching
  // Reference: https://tanstack.com/query/latest/docs/framework/react/guides/displaying-cached-data
  const showLoadingState = (isUserLoading || (isItemLoading && !item) || !userId);
  
  // Show error state (but still show cached data if available)
  const showErrorState = (error || !item) && !item;

  if (showLoadingState) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="Item Details" showBackButton={true} onBackPress={handleBackPress} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading item details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state only when there's no cached data to show
  if (showErrorState) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="Item Details" showBackButton={true} onBackPress={handleBackPress} />
        <View style={styles.centerContent}>
          <ThemedText type="subtitle" style={styles.errorText}>Item not found</ThemedText>
          <ThemedText style={styles.errorDescription}>
            The item you&apos;re looking for doesn&apos;t exist or has been deleted.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const statusColors = {
    clean: '#34C759',
    worn: '#FF9500',
    dirty: '#FF3B30',
  };

  const statusNames = {
    clean: 'Clean',
    worn: 'Worn',
    dirty: 'Dirty',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader title="Item Details" showBackButton={true} onBackPress={handleBackPress} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Show subtle loading indicator if refetching in background */}
        {isFetching && !isItemLoading && item && (
          <View style={styles.refetchIndicator}>
            <ActivityIndicator size="small" color={tintColor} />
            <ThemedText style={styles.refetchText}>Updating...</ThemedText>
          </View>
        )}
        
        {/* Item Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image_clean || item.image_original || 'https://via.placeholder.com/400' }} 
            style={styles.itemImage} 
          />
          
          {/* Status Badge */}
          <View style={[styles.statusBadge, { 
            backgroundColor: statusColors[item.status] 
          }]}>
            <IconSymbol name={item.status === 'clean' ? 'checkmark.circle.fill' : 'tshirt.fill'} size={12} color="white" />
            <ThemedText style={styles.statusText}>{statusNames[item.status]}</ThemedText>
          </View>
        </View>

        {/* Item Info */}
        <View style={[styles.infoSection, { backgroundColor }]}>
          {/* Title and Category */}
          <ThemedText type="title" style={styles.itemName}>{item.title}</ThemedText>
          <View style={styles.categoryBadge}>
            {/* 🏷️ Generic tag icon for all dynamic categories */}
            <IconSymbol 
              name="tag.fill"
              size={14}
              color={tintColor}
            />
            <ThemedText style={[styles.categoryText, { color: tintColor }]}>
              {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
            </ThemedText>
          </View>
          
          {/* Description */}
          {item.description && (
            <ThemedText style={styles.description}>
              {item.description}
            </ThemedText>
          )}
        </View>

        {/* Colors & Tags Section */}
        {((item.colors && item.colors.length > 0) || (item.tags && item.tags.length > 0)) && (
          <View style={[styles.detailsCard, { backgroundColor }]}>
            {/* Colors */}
            {item.colors && item.colors.length > 0 && (
              <View style={styles.detailBlock}>
                <ThemedText style={styles.detailBlockLabel}>COLORS</ThemedText>
                <View style={styles.chipContainer}>
                  {item.colors.map((color) => (
                    <View key={color} style={[styles.colorChip, { backgroundColor: tintColor + '20', borderColor: tintColor }]}>
                      <ThemedText style={[styles.colorChipText, { color: tintColor }]}>{color}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Tags */}
            {item.tags && item.tags.length > 0 && (
              <View style={[styles.detailBlock, item.colors && item.colors.length > 0 && styles.detailBlockWithBorder]}>
                <ThemedText style={styles.detailBlockLabel}>TAGS</ThemedText>
                <View style={styles.chipContainer}>
                  {item.tags.map((tag) => (
                    <View key={tag} style={[styles.tagChip, { borderColor: borderColor }]}>
                      <IconSymbol name="tag.fill" size={11} color={textColor} />
                      <ThemedText style={[styles.tagText, { color: textColor }]}>{tag}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          {/* Try Virtually Button */}
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: tintColor }]}
            onPress={handleTryVirtually}
          >
            <IconSymbol name="camera.fill" size={20} color="white" />
            <ThemedText style={styles.primaryButtonText}>Try Virtually</ThemedText>
          </TouchableOpacity>

          {/* Status Update Buttons */}
          <View style={styles.secondaryActions}>
            {item.status === 'clean' && (
              <TouchableOpacity 
                style={[styles.secondaryButton, { borderColor }]}
                onPress={handleMarkAsWorn}
              >
                <IconSymbol name="tshirt.fill" size={18} color={tintColor} />
                <ThemedText style={[styles.secondaryButtonText, { color: tintColor }]}>
                  Mark as Worn Today
                </ThemedText>
              </TouchableOpacity>
            )}
            
            {item.status === 'worn' && (
              <>
                <TouchableOpacity 
                  style={[styles.secondaryButton, { borderColor }]}
                  onPress={handleMarkAsClean}
                >
                  <IconSymbol name="checkmark.circle.fill" size={18} color={tintColor} />
                  <ThemedText style={[styles.secondaryButtonText, { color: tintColor }]}>
                    Mark as Clean
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.secondaryButton, { borderColor }]}
                  onPress={handleMarkAsDirty}
                >
                  <IconSymbol name="exclamationmark.circle.fill" size={18} color="#FF3B30" />
                  <ThemedText style={[styles.secondaryButtonText, { color: '#FF3B30' }]}>
                    Mark as Dirty
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}
            
            {item.status === 'dirty' && (
              <TouchableOpacity 
                style={[styles.secondaryButton, { borderColor }]}
                onPress={handleMarkAsClean}
              >
                <IconSymbol name="checkmark.circle.fill" size={18} color={tintColor} />
                <ThemedText style={[styles.secondaryButtonText, { color: tintColor }]}>
                  Mark as Clean
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* Other Actions */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, { borderColor: borderColor }]}
              onPress={handleEditItem}
            >
              <IconSymbol name="pencil" size={18} color={textColor} />
              <ThemedText style={[styles.actionButtonText, { color: textColor }]}>Edit Item</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeleteItem}
            >
              <IconSymbol name="trash" size={18} color="#FF3B30" />
              <ThemedText style={[styles.actionButtonText, styles.deleteButtonText]}>Delete Item</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Wear Tracking Section */}
        {(item.last_worn_at || ((item.wear_count ?? 0) > 0)) && (
          <View style={[styles.detailsCard, { backgroundColor }]}>
            <ThemedText style={styles.detailBlockLabel}>WEAR HISTORY</ThemedText>
            <View style={styles.wearHistoryRow}>
              {item.last_worn_at && (
                <View style={styles.wearHistoryItem}>
                  <IconSymbol name="calendar" size={16} color={tintColor} />
                  <View style={styles.wearHistoryText}>
                    <ThemedText style={styles.wearHistoryLabel}>Last Worn</ThemedText>
                    <ThemedText style={[styles.wearHistoryValue, { color: tintColor }]}>
                      {formatLastWorn(item.last_worn_at)}
                    </ThemedText>
                  </View>
                </View>
              )}
              {((item.wear_count ?? 0) > 0) ? (
                <View style={styles.wearHistoryItem}>
                  <IconSymbol name="tshirt.fill" size={16} color={tintColor} />
                  <View style={styles.wearHistoryText}>
                    <ThemedText style={styles.wearHistoryLabel}>Total Wears</ThemedText>
                    <ThemedText style={[styles.wearHistoryValue, { color: tintColor }]}>
                      {item.wear_count} {item.wear_count === 1 ? 'time' : 'times'}
                    </ThemedText>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* Item Metadata */}
        <View style={styles.metadataSection}>
          <ThemedText style={styles.metadataLabel}>Added on {new Date(item.created_at).toLocaleDateString()}</ThemedText>
          {item.updated_at && (
            <ThemedText style={styles.metadataLabel}>
              Last updated {new Date(item.updated_at).toLocaleDateString()}
            </ThemedText>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  errorDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  itemImage: {
    width: width - 32,
    height: 400,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.7,
    marginTop: 0,
  },
  detailsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailBlock: {
    marginBottom: 0,
  },
  detailBlockWithBorder: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.15)',
  },
  detailBlockLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 12,
    opacity: 0.5,
    letterSpacing: 1,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  titleRow: {
    marginBottom: 16,
  },
  titleContent: {
    gap: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  
  attributeRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  attributeLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colorChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  colorChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsSection: {
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryActions: {
    marginBottom: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
  metadataSection: {
    paddingTop: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    marginTop: 20,
  },
  metadataLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  wearHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  wearHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wearHistoryText: {
    flexDirection: 'column',
  },
  wearHistoryLabel: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 2,
  },
  wearHistoryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Background refetch indicator
  refetchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 8,
    marginBottom: 8,
  },
  refetchText: {
    fontSize: 12,
    opacity: 0.6,
  },
});

