import { StyleSheet, View, ScrollView, TouchableOpacity, Image, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomHeader } from '@/components/home/CustomHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

// Product interface matching catalog
interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  sales: number;
  revenue: number;
  views: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  tags: string[];
  description: string;
  createdAt: string;
  lastUpdated: string;
  rating: number;
  reviews: number;
}

// Mock data - in production, fetch from API
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Designer Blazer',
    category: 'outerwear',
    brand: 'Fashion Forward',
    price: 45000,
    originalPrice: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=400&h=400&fit=crop',
    sales: 45,
    revenue: 2025000,
    views: 1200,
    stock: 8,
    status: 'active',
    tags: ['formal', 'business', 'premium'],
    description: 'Elegant designer blazer perfect for business meetings and formal occasions.',
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-15',
    rating: 4.8,
    reviews: 23
  },
  {
    id: '2',
    name: 'Silk Evening Dress',
    category: 'dress',
    brand: 'Elegance Co',
    price: 75000,
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop',
    sales: 32,
    revenue: 2400000,
    views: 980,
    stock: 3,
    status: 'active',
    tags: ['elegant', 'formal', 'luxury'],
    description: 'Luxurious silk evening dress for special occasions and formal events.',
    createdAt: '2024-01-02',
    lastUpdated: '2024-01-14',
    rating: 4.9,
    reviews: 18
  },
];

/**
 * Product Edit Screen
 * Comprehensive product editing interface for boutique owners
 */
export default function ProductEditScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const { productId } = useLocalSearchParams();
  
  const product = mockProducts.find(p => p.id === productId);
  
  // Form state
  const [formData, setFormData] = useState({
    name: product?.name || '',
    category: product?.category || '',
    brand: product?.brand || '',
    price: product?.price.toString() || '',
    originalPrice: product?.originalPrice?.toString() || '',
    stock: product?.stock.toString() || '',
    status: product?.status || 'active',
    tags: product?.tags.join(', ') || '',
    description: product?.description || '',
    imageUrl: product?.imageUrl || '',
  });

  const handleBackPress = () => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to go back? Any unsaved changes will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive',
          onPress: () => router.back()
        }
      ]
    );
  };

  const handleImageUpload = () => {
    Alert.alert(
      'Select Image',
      'Choose how you\'d like to update the product image',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Camera', 
          onPress: () => {
            // Mock camera functionality
            Alert.alert('Success', 'Image captured from camera!');
          }
        },
        { 
          text: 'Gallery', 
          onPress: () => {
            // Mock gallery functionality
            Alert.alert('Success', 'Image selected from gallery!');
          }
        }
      ]
    );
  };

  const handleSave = () => {
    // Validation
    if (!formData.name || !formData.category || !formData.brand || !formData.price) {
      Alert.alert('Missing Information', 'Please fill in all required fields (Name, Category, Brand, Price)');
      return;
    }

    const price = parseInt(formData.price);
    const originalPrice = formData.originalPrice ? parseInt(formData.originalPrice) : undefined;

    if (Number.isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price greater than 0');
      return;
    }

    if (originalPrice && (Number.isNaN(originalPrice) || originalPrice <= price)) {
      Alert.alert('Invalid Original Price', 'Original price must be greater than current price');
      return;
    }

    // Save changes
    Alert.alert('Success', 'Product updated successfully!');
    router.back();
  };

  const handleToggleStatus = () => {
    const newStatus = formData.status === 'active' ? 'inactive' : 'active';
    setFormData(prev => ({ ...prev, status: newStatus }));
  };

  const getStatusColor = () => {
    switch (formData.status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#FFA500';
      case 'out_of_stock': return '#FF5722';
      default: return iconColor;
    }
  };

  if (!product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <CustomHeader title="Edit Product" showBackButton={true} onBackPress={() => router.back()} />
        <View style={styles.centerContent}>
          <ThemedText>Product not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <CustomHeader 
        title="Edit Product" 
        showBackButton={true} 
        onBackPress={handleBackPress}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Upload Section */}
          <View style={[styles.imageSection, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Product Image</ThemedText>
            <TouchableOpacity 
              style={[styles.imageButton, { backgroundColor }]}
              onPress={handleImageUpload}
            >
              {formData.imageUrl ? (
                <Image source={{ uri: formData.imageUrl }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <IconSymbol name="camera.fill" size={40} color={iconColor} />
                  <ThemedText style={[styles.uploadText, { color: iconColor }]}>
                    Tap to add image
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Basic Information */}
          <View style={[styles.section, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Basic Information</ThemedText>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Product Name *</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor, color: textColor }]}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Enter product name"
                placeholderTextColor={iconColor}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <ThemedText style={styles.label}>Category *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor, color: textColor }]}
                  value={formData.category}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
                  placeholder="e.g., dress, top"
                  placeholderTextColor={iconColor}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <ThemedText style={styles.label}>Brand *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor, color: textColor }]}
                  value={formData.brand}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, brand: text }))}
                  placeholder="Brand name"
                  placeholderTextColor={iconColor}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Description</ThemedText>
              <TextInput
                  style={[styles.textArea, { backgroundColor, color: textColor }]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                placeholder="Product description"
                placeholderTextColor={iconColor}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Pricing */}
          <View style={[styles.section, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Pricing</ThemedText>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <ThemedText style={styles.label}>Price *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor, color: textColor }]}
                  value={formData.price}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                  placeholder="Current price"
                  placeholderTextColor={iconColor}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <ThemedText style={styles.label}>Original Price</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor, color: textColor }]}
                  value={formData.originalPrice}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, originalPrice: text }))}
                  placeholder="Original price"
                  placeholderTextColor={iconColor}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Inventory & Status */}
          <View style={[styles.section, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Inventory & Status</ThemedText>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <ThemedText style={styles.label}>Stock Quantity</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor, color: textColor }]}
                  value={formData.stock}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
                  placeholder="Stock quantity"
                  placeholderTextColor={iconColor}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <ThemedText style={styles.label}>Status</ThemedText>
                <TouchableOpacity 
                  style={[styles.statusButton, { backgroundColor: getStatusColor() }]}
                  onPress={handleToggleStatus}
                >
                  <ThemedText style={styles.statusButtonText}>
                    {formData.status.replace('_', ' ').toUpperCase()}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Tags (comma-separated)</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor, color: textColor }]}
                value={formData.tags}
                onChangeText={(text) => setFormData(prev => ({ ...prev, tags: text }))}
                placeholder="e.g., formal, business, premium"
                placeholderTextColor={iconColor}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.cancelButton, { borderColor: iconColor }]}
              onPress={handleBackPress}
            >
              <ThemedText style={[styles.cancelButtonText, { color: iconColor }]}>
                Discard Changes
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: tintColor }]}
              onPress={handleSave}
            >
              <ThemedText style={styles.saveButtonText}>
                Save Changes
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginTop: 20,
    flex: 1,
    paddingHorizontal: 20,
  },
  imageSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
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
  imageButton: {
    width: 200,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  uploadText: {
    fontSize: 14,
    marginTop: 8,
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
  inputGroup: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
  },
  statusButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  statusButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 20,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
