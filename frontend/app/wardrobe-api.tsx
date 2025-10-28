/**
 * Wardrobe API Integration
 * Temporary file to demonstrate API integration
 * This will be merged into the main wardrobe.tsx
 */

import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useWardrobeItems, useUpdateWardrobeItemStatus } from '@/hooks/useWardrobe';
import { useUser } from '@/hooks/useAuthQuery';

// Display item type
interface DisplayItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  colors: string[];
  tags: string[];
  status: 'clean' | 'dirty' | 'worn';
}

/**
 * Wardrobe Screen with API Integration
 */
export default function WardrobeScreenWithAPI() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  // Get current user
  const { data: user } = useUser();
  const userId = user?.id || 1;
  
  // Fetch wardrobe items from API
  const { data: apiItems = [], isLoading, error } = useWardrobeItems(userId);
  const updateStatusMutation = useUpdateWardrobeItemStatus();
  
  // Convert API items to display format
  const wardrobeItems: DisplayItem[] = apiItems.map(item => ({
    id: item.id.toString(),
    title: item.title,
    category: item.category,
    imageUrl: item.image_original || item.image_clean || 'https://via.placeholder.com/150',
    colors: item.colors || [],
    tags: item.tags || [],
    status: item.status,
  }));
  
  // Handler for status changes
  const handleStatusChange = async (itemId: string, newStatus: 'clean' | 'worn') => {
    try {
      await updateStatusMutation.mutateAsync({
        itemId: parseInt(itemId),
        userId,
        status: newStatus,
      });
      
      Alert.alert('Item Updated', `Item marked as ${newStatus}.`);
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert('Error', 'Failed to update item status. Please try again.');
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="My Wardrobe" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading your wardrobe...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="My Wardrobe" />
        <View style={styles.centerContent}>
          <ThemedText type="title">Error loading wardrobe</ThemedText>
          <ThemedText style={styles.errorText}>
            Please check your connection and try again.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Show empty state if no items
  if (wardrobeItems.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="My Wardrobe" />
        <View style={styles.centerContent}>
          <ThemedText type="title">Your Wardrobe is Empty</ThemedText>
          <ThemedText style={styles.errorText}>
            Start building your digital wardrobe by adding your favorite clothing items.
          </ThemedText>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: tintColor }]}
            onPress={() => router.push('/add-item')}
          >
            <ThemedText style={styles.addButtonText}>Add Your First Item</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Filter items by category
  const topItems = wardrobeItems.filter(item => item.category === 'top' && item.status === 'clean');
  const wornItems = wardrobeItems.filter(item => item.status === 'worn');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader title="My Wardrobe" />
      
      <ScrollView style={styles.content}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Your Wardrobe ({wardrobeItems.length} items)
        </ThemedText>

        {/* Worn Items Section */}
        {wornItems.length > 0 && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Worn Items</ThemedText>
            {wornItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemCard, { backgroundColor }]}
                onPress={() => handleStatusChange(item.id, 'clean')}
              >
                <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.itemCategory}>{item.category}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Clean Items Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Clean Items</ThemedText>
          {topItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, { backgroundColor }]}
              onPress={() => handleStatusChange(item.id, 'worn')}
            >
              <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.itemCategory}>{item.category}</ThemedText>
              {item.tags && item.tags.length > 0 && (
                <View style={styles.tags}>
                  {item.tags.slice(0, 2).map((tag, idx) => (
                    <ThemedText key={idx} style={styles.tag}>#{tag}</ThemedText>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: tintColor }]}
        onPress={() => router.push('/add-item')}
      >
        <IconSymbol name="plus" size={24} color="white" />
      </TouchableOpacity>
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
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  itemCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    fontSize: 12,
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

