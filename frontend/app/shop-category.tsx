import { ShopCategoryViewScreen } from '@/components/home/ShopCategoryViewScreen';
import { useLocalSearchParams } from 'expo-router';

// Mock boutique data (same as in explore.tsx and ShopCategoryViewScreen.tsx)
const mockBoutiqueData = [
  {
    id: '1',
    title: 'Designer Blazer',
    brand: 'Fashion Forward',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=300&h=400&fit=crop',
    price: 45000,
    colors: ['navy', 'black'],
    tags: ['formal', 'business'],
    boutique: {
      id: 'b1',
      name: 'Luxe Boutique',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '2',
    title: 'Silk Evening Dress',
    brand: 'Elegance Co',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
    price: 85000,
    colors: ['black', 'emerald'],
    tags: ['formal', 'evening'],
    boutique: {
      id: 'b2',
      name: 'Chic Collection',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '3',
    title: 'Casual Denim Jacket',
    brand: 'Urban Style',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=400&fit=crop',
    price: 25000,
    colors: ['blue', 'black'],
    tags: ['casual', 'denim'],
    boutique: {
      id: 'b3',
      name: 'Street Fashion',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: false
  },
  {
    id: '4',
    title: 'Premium Sneakers',
    brand: 'Athletic Pro',
    category: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=400&fit=crop',
    price: 35000,
    colors: ['white', 'black'],
    tags: ['casual', 'athletic'],
    boutique: {
      id: 'b4',
      name: 'Sport Hub',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '5',
    title: 'Luxury Handbag',
    brand: 'Premium Leather',
    category: 'accessories',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=400&fit=crop',
    price: 120000,
    colors: ['brown', 'black'],
    tags: ['luxury', 'leather'],
    boutique: {
      id: 'b5',
      name: 'Elite Accessories',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '6',
    title: 'Summer Maxi Dress',
    brand: 'Boho Chic',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
    price: 32000,
    colors: ['floral', 'white'],
    tags: ['casual', 'summer'],
    boutique: {
      id: 'b6',
      name: 'Bohemian Dreams',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: false
  },
  {
    id: '7',
    title: 'Business Suit',
    brand: 'Corporate Elite',
    category: 'outerwear',
    imageUrl: 'https://images.unsplash.com/photo-1594938298605-c04c1c4d8f69?w=300&h=400&fit=crop',
    price: 95000,
    colors: ['charcoal', 'navy'],
    tags: ['formal', 'business'],
    boutique: {
      id: 'b7',
      name: 'Executive Wear',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  },
  {
    id: '8',
    title: 'Cocktail Dress',
    brand: 'Evening Glam',
    category: 'dress',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop',
    price: 65000,
    colors: ['red', 'black'],
    tags: ['formal', 'evening'],
    boutique: {
      id: 'b8',
      name: 'Glamour House',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
    },
    arAvailable: true
  }
];

/**
 * Shop Category View Route Component
 * Handles navigation to specific shop categories
 * Uses URL parameters to determine which category to display
 */
export default function ShopCategoryView() {
  const params = useLocalSearchParams<{ category?: string | string[] }>();
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  
  // Handle special cases and filter items by category
  let categoryItems: typeof mockBoutiqueData;
  if (category === 'all') {
    // Show all boutique items
    categoryItems = mockBoutiqueData;
  } else {
    // Filter items by category
    categoryItems = mockBoutiqueData.filter(item => item.category === category);
  }
  
  if (!category) {
    return null; // Handle missing category parameter
  }

  return (
    <ShopCategoryViewScreen 
      category={category} 
      items={categoryItems} 
    />
  );
}
