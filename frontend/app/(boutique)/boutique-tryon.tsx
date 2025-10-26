import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Alert, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router, useLocalSearchParams } from 'expo-router';

// Product interface
interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
}

// Mock customer photos (in production, fetch from backend)
const mockCustomerPhotos = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    photoUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop',
    uploadedAt: '2024-01-15'
  },
  {
    id: '2',
    customerName: 'Michael Chen',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
    uploadedAt: '2024-01-14'
  },
  {
    id: '3',
    customerName: 'Emma Wilson',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop',
    uploadedAt: '2024-01-13'
  }
];

// Mock products
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Designer Blazer',
    category: 'outerwear',
    brand: 'Fashion Forward',
    price: 45000,
    originalPrice: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=400&h=400&fit=crop'
  },
  {
    id: '2',
    name: 'Silk Evening Dress',
    category: 'dress',
    brand: 'Elegance Co',
    price: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop'
  },
];

/**
 * Boutique Try-On Screen
 * Allows boutique owners to virtually try products on customers
 */
export default function BoutiqueTryOnScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const { productId } = useLocalSearchParams();
  
  const product = mockProducts.find(p => p.id === productId);
  const [selectedCustomer, setSelectedCustomer] = React.useState<string | null>(null);
  const [savedCustomers, setSavedCustomers] = useState(mockCustomerPhotos);
  const [searchQuery, setSearchQuery] = useState('');

  const handleBackPress = () => {
    router.back();
  };

  const handleAddCustomerPhoto = () => {
    Alert.alert(
      'Add Customer Photo',
      'How would you like to capture the customer photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Camera', 
          onPress: () => {
            // Mock camera functionality
            const mockPhotoUrl = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop';
            // Prompt for customer name
            Alert.prompt(
              'Customer Name',
              'Enter the customer name:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Save',
                  onPress: (name) => {
                    if (name) {
                      const newCustomer = {
                        id: Date.now().toString(),
                        customerName: name,
                        photoUrl: mockPhotoUrl,
                        uploadedAt: new Date().toISOString().split('T')[0]
                      };
                      setSavedCustomers(prev => [...prev, newCustomer]);
                      setSelectedCustomer(newCustomer.id);
                      Alert.alert('Success', 'Customer photo saved!');
                    }
                  }
                }
              ],
              'plain-text'
            );
          }
        },
        { 
          text: 'Gallery', 
          onPress: () => {
            // Mock gallery functionality
            const mockPhotoUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop';
            Alert.prompt(
              'Customer Name',
              'Enter the customer name:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Save',
                  onPress: (name) => {
                    if (name) {
                      const newCustomer = {
                        id: Date.now().toString(),
                        customerName: name,
                        photoUrl: mockPhotoUrl,
                        uploadedAt: new Date().toISOString().split('T')[0]
                      };
                      setSavedCustomers(prev => [...prev, newCustomer]);
                      setSelectedCustomer(newCustomer.id);
                      Alert.alert('Success', 'Customer photo saved!');
                    }
                  }
                }
              ],
              'plain-text'
            );
          }
        }
      ]
    );
  };

  const handleDeleteCustomerPhoto = (customerId: string) => {
    Alert.alert(
      'Delete Customer Photo',
      'Are you sure you want to delete this customer photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setSavedCustomers(prev => prev.filter(c => c.id !== customerId));
            if (selectedCustomer === customerId) {
              setSelectedCustomer(null);
            }
            Alert.alert('Success', 'Customer photo deleted');
          }
        }
      ]
    );
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomer(customerId);
  };

  const handleGenerateTryOn = () => {
    if (!selectedCustomer) {
      Alert.alert('Select Customer', 'Please select a customer photo first');
      return;
    }

    Alert.alert(
      'Generate Virtual Try-On?',
      'This will create a virtual try-on image using AI. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate', 
          onPress: () => {
            Alert.alert('Success', 'Virtual try-on generated! (Mock implementation)');
          }
        }
      ]
    );
  };

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="Virtual Try-On" showBackButton={true} onBackPress={handleBackPress} />
        <View style={styles.centerContent}>
          <ThemedText>Product not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Filter customers based on search
  const filteredCustomers = savedCustomers.filter(customer =>
    customer.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCustomerPhoto = selectedCustomer 
    ? savedCustomers.find(c => c.id === selectedCustomer)
    : null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader 
        title="Virtual Try-On" 
        showBackButton={true} 
        onBackPress={handleBackPress}
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Info */}
        <View style={[styles.section, { backgroundColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Product</ThemedText>
          <View style={styles.productInfo}>
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <ThemedText type="title" style={styles.productName}>{product.name}</ThemedText>
              <ThemedText style={[styles.brand, { color: iconColor }]}>{product.brand}</ThemedText>
              <ThemedText style={styles.price}>₦{product.price.toLocaleString()}</ThemedText>
            </View>
          </View>
        </View>

        {/* Customer Selection */}
        <View style={[styles.section, { backgroundColor }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Select Customer Photo</ThemedText>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: tintColor }]}
              onPress={handleAddCustomerPhoto}
            >
              <IconSymbol name="plus" size={18} color="white" />
              <ThemedText style={styles.addButtonText}>Add</ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText style={[styles.description, { color: iconColor }]}>
            Choose a saved customer photo to try the product on
          </ThemedText>
          
          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor }]}>
            <IconSymbol name="magnifyingglass" size={20} color={iconColor} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search customers..."
              placeholderTextColor={iconColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol name="xmark.circle.fill" size={20} color={iconColor} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.customerList}>
            {/* Add Customer Button */}
            <TouchableOpacity
              style={[styles.addCustomerButton, { backgroundColor: tintColor + '20', borderColor: tintColor }]}
              onPress={handleAddCustomerPhoto}
            >
              <IconSymbol name="plus.circle.fill" size={24} color={tintColor} />
              <ThemedText style={[styles.addCustomerButtonText, { color: tintColor }]}>
                Add Customer Photo
              </ThemedText>
            </TouchableOpacity>

            {/* Customer List */}
            <FlatList
              data={filteredCustomers}
              keyExtractor={(item) => item.id}
              renderItem={({ item: customer }) => (
                <TouchableOpacity
                  style={[
                    styles.customerItem,
                    { 
                      backgroundColor: selectedCustomer === customer.id ? tintColor + '10' : backgroundColor,
                      borderColor: selectedCustomer === customer.id ? tintColor : 'transparent',
                    }
                  ]}
                  onPress={() => handleSelectCustomer(customer.id)}
                  onLongPress={() => handleDeleteCustomerPhoto(customer.id)}
                >
                  <Image source={{ uri: customer.photoUrl }} style={styles.customerAvatar} />
                  <View style={styles.customerItemInfo}>
                    <ThemedText style={styles.customerItemName}>{customer.customerName}</ThemedText>
                    <ThemedText style={[styles.customerItemDate, { color: iconColor }]}>
                      Saved on {customer.uploadedAt}
                    </ThemedText>
                  </View>
                  {selectedCustomer === customer.id && (
                    <View style={[styles.checkmark, { backgroundColor: tintColor }]}>
                      <IconSymbol name="checkmark.circle.fill" size={24} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
              scrollEnabled={false}
              ListEmptyComponent={
                filteredCustomers.length === 0 && searchQuery ? (
                  <View style={styles.emptyState}>
                    <ThemedText style={[styles.emptyStateText, { color: iconColor }]}>
                      No customers found matching "{searchQuery}"
                    </ThemedText>
                  </View>
                ) : null
              }
            />
          </View>
        </View>

        {/* Selected Customer Preview */}
        {selectedCustomerPhoto && (
          <View style={[styles.section, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Preview</ThemedText>
            <View style={styles.previewContainer}>
              <Image 
                source={{ uri: selectedCustomerPhoto.photoUrl }} 
                style={styles.previewImage} 
              />
              <View style={styles.previewOverlay}>
                <ThemedText style={styles.previewText}>
                  {selectedCustomerPhoto.customerName}
                </ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Generate Button */}
        <TouchableOpacity 
          style={[
            styles.generateButton, 
            { backgroundColor: tintColor },
            !selectedCustomer && { backgroundColor: iconColor, opacity: 0.5 }
          ]}
          onPress={handleGenerateTryOn}
          disabled={!selectedCustomer}
        >
          <IconSymbol name="camera.fill" size={20} color="white" />
          <ThemedText style={styles.generateButtonText}>
            Generate Virtual Try-On
          </ThemedText>
        </TouchableOpacity>
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
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
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
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  customerList: {
    gap: 8,
  },
  addCustomerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 8,
  },
  addCustomerButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  customerItemInfo: {
    flex: 1,
  },
  customerItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  customerItemDate: {
    fontSize: 13,
    opacity: 0.7,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
  },
  previewText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  emptyState: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
