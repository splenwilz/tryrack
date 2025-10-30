import { CategoryViewScreen } from '@/components/home/CategoryViewScreen';
import { useLocalSearchParams } from 'expo-router';
import { useUser } from '@/hooks/useAuthQuery';
import { useWardrobeItems } from '@/hooks/useWardrobe';
import { View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * Category View Route Component
 * Handles navigation to specific wardrobe categories with API data
 */
export default function CategoryView() {
  const { data: user } = useUser();
  const userId = user?.id || 0;
  
  const { data: allItems = [], isLoading, error } = useWardrobeItems(userId);
  
  const params = useLocalSearchParams<{ category?: string | string[] }>();
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  
  if (!category) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <CategoryViewScreen 
        category={category} 
        items={[]}
        isLoading={true}
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <CategoryViewScreen 
        category={category} 
        items={[]}
        error={error}
      />
    );
  }

  // Convert API items to display format
  const convertedItems = allItems.map(item => ({
    id: item.id.toString(),
    title: item.title,
    category: item.category,
    imageUrl: item.image_clean || item.image_original || 'https://via.placeholder.com/150',
    colors: item.colors || [],
    tags: item.tags || [],
  }));

  // Filter items by category
  let categoryItems;
  if (category === 'recent') {
    // Show recently added items (first 10 items by created_at)
    categoryItems = [...convertedItems]
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 10);
  } else {
    // Map category name from UI to backend category
    const categoryMap: Record<string, string> = {
      'tops': 'top',
      'bottoms': 'bottom',
      'shoes': 'shoes',
      'outerwear': 'outerwear',
      'dress': 'dress',
      'accessories': 'accessories',
      'underwear': 'underwear',
    };
    
    const backendCategory = categoryMap[category] || category;
    
    // Filter items by category (only show clean items)
    categoryItems = convertedItems.filter(
      item => item.category === backendCategory && 
      allItems.find(apiItem => apiItem.id.toString() === item.id)?.status === 'clean'
    );
  }

  return (
    <CategoryViewScreen 
      category={category} 
      items={categoryItems}
    />
  );
}

// Deprecated mock data - kept for reference
const mockWardrobeData = [
  // TOPS
  {
    id: '1',
    title: 'White Cotton T-Shirt',
    category: 'top',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=400&fit=crop',
    colors: ['white'],
    tags: ['casual', 'basic']
  },
  {
    id: '2',
    title: 'Black Hoodie',
    category: 'top',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a8?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['casual', 'street']
  },
  {
    id: '3',
    title: 'Navy Blouse',
    category: 'top',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    colors: ['navy'],
    tags: ['formal', 'work']
  },
  
  // BOTTOMS
  {
    id: '4',
    title: 'Dark Jeans',
    category: 'bottom',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&h=400&fit=crop',
    colors: ['blue'],
    tags: ['casual', 'denim']
  },
  {
    id: '5',
    title: 'Navy Sweatpants',
    category: 'bottom',
    imageUrl: 'https://images.unsplash.com/photo-1506629905607-3a4b4b4b4b4b?w=300&h=400&fit=crop',
    colors: ['navy'],
    tags: ['casual', 'athletic']
  },
  {
    id: '6',
    title: 'Black Trousers',
    category: 'bottom',
    imageUrl: 'https://images.unsplash.com/photo-1591195853828-9db59c24745a?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['formal', 'work']
  },
  
  // OUTERWEAR
  {
    id: '7',
    title: 'Blue Denim Jacket',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=400&fit=crop',
    colors: ['blue'],
    tags: ['casual', 'denim']
  },
  {
    id: '8',
    title: 'Black Leather Jacket',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['casual', 'leather']
  },
  
  // SHOES
  {
    id: '9',
    title: 'White Sneakers',
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
    colors: ['white'],
    tags: ['casual', 'athletic']
  },
  {
    id: '10',
    title: 'Black Dress Shoes',
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['formal', 'work']
  },
  {
    id: '11',
    title: 'Brown Boots',
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=300&h=400&fit=crop',
    colors: ['brown'],
    tags: ['casual', 'boots']
  },
  
  // DRESSES
  {
    id: '12',
    title: 'Black Little Dress',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['formal', 'elegant']
  },
  {
    id: '13',
    title: 'Floral Summer Dress',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
    colors: ['multi'],
    tags: ['casual', 'summer']
  },
  
  // ACCESSORIES
  {
    id: '14',
    title: 'Black Handbag',
    category: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['bag', 'casual']
  },
  {
    id: '15',
    title: 'Gold Watch',
    category: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5b88c7c4c38?w=300&h=400&fit=crop',
    colors: ['gold'],
    tags: ['watch', 'luxury']
  },
  {
    id: '16',
    title: 'Silver Necklace',
    category: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=400&fit=crop',
    colors: ['silver'],
    tags: ['jewelry', 'elegant']
  },
  
  // UNDERWEAR/LINGERIE
  {
    id: '17',
    title: 'White Cotton Bra',
    category: 'underwear',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    colors: ['white'],
    tags: ['basic', 'comfortable']
  },
  {
    id: '18',
    title: 'Black Lace Set',
    category: 'underwear',
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop',
    colors: ['black'],
    tags: ['lace', 'elegant']
  }
];
