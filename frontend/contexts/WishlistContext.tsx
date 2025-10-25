import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Boutique item interface (same as in other files)
interface BoutiqueItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  imageUrl: string;
  price: number;
  colors: string[];
  tags: string[];
  boutique: {
    id: string;
    name: string;
    logo: string;
  };
  arAvailable: boolean;
}

interface WishlistContextType {
  wishlistItems: BoutiqueItem[];
  addToWishlist: (item: BoutiqueItem) => void;
  removeFromWishlist: (itemId: string) => void;
  isInWishlist: (itemId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = '@wishlist_items';

/**
 * Wishlist Provider Component
 * Manages wishlist state and persistence using AsyncStorage
 * Provides methods to add, remove, and check wishlist items
 */
export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<BoutiqueItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadWishlist = useCallback(async () => {
    try {
      const storedItems = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
      if (storedItems) {
        setWishlistItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  }, []);

  const saveWishlist = useCallback(async () => {
    try {
      await AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  }, [wishlistItems]);

  // Load wishlist from storage on mount
  useEffect(() => {
    loadWishlist().then(() => setIsInitialized(true));
  }, [loadWishlist]);

  // Save wishlist to storage whenever it changes (but only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    saveWishlist();
  }, [isInitialized, saveWishlist]);

  const addToWishlist = (item: BoutiqueItem) => {
    if (!isInWishlist(item.id)) {
      setWishlistItems(prev => [...prev, item]);
    }
  };

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const isInWishlist = (itemId: string): boolean => {
    return wishlistItems.some(item => item.id === itemId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const value: WishlistContextType = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

/**
 * Hook to use wishlist context
 * Provides access to wishlist state and methods
 */
export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
