/**
 * Custom hooks for Virtual Try-On API integration
 * Handles generating and polling for virtual try-on results
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import * as FileSystem from 'expo-file-system/legacy';

// Types
export interface ItemDetails {
  category: string;
  colors: string[];
  type: 'wardrobe' | 'boutique';
  item_id?: string; // Optional ID of the specific item
}

export interface VirtualTryOnRequest {
  // Prefer URLs when available; fall back to base64 for fresh photos
  user_image_url?: string;
  item_image_url?: string; // Legacy: single item image URL (backward compatibility)
  user_image_base64?: string;
  item_image_base64?: string; // Legacy: single item image base64 (backward compatibility)
  item_details: ItemDetails | ItemDetails[]; // Support both single item (legacy) and multiple items
  use_clean_background?: boolean; // Optional: default false (keep original background)
  custom_prompt?: string; // Optional: user-defined custom prompt for AI generation
}

export interface TryOnSuggestion {
  id: number;
  title: string;
  category: string;
  colors: string[];
  imageUrl: string;
  compatibility_score: number;
  compatibility_reasons: string[];
  [key: string]: any; // Allow other wardrobe item fields
}

export interface TryOnSuggestionsResponse {
  category: string;
  item_colors: string[];
  suggestions: TryOnSuggestion[];
  total_suggestions: number;
  message?: string;
}

export interface VirtualTryOnResult {
  id: number;
  user_id: number;
  item_type: string;
  item_id: string;
  user_image_url: string;
  item_image_url: string;
  result_image_url: string | null;
  result_image_base64?: string | null;
  status: 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Hook to generate a virtual try-on
 */
export function useGenerateVirtualTryOn() {
  return useMutation({
    mutationFn: async ({
      userId,
      request,
    }: {
      userId: number;
      request: VirtualTryOnRequest;
    }): Promise<VirtualTryOnResult> => {
      const response = await apiClient.post<VirtualTryOnResult>(
        `/virtual-tryon/generate?user_id=${userId}`,
        request
      );
      return response;
    },
    onError: (error: any) => {
      console.error('❌ Error generating virtual try-on:', error);
      throw error;
    },
  });
}

/**
 * Hook to poll for virtual try-on result
 * Automatically refetches every 2 seconds while status is 'processing'
 */
export function useVirtualTryOnResult(
  tryonId: number | null,
  userId: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['virtualTryOn', tryonId, userId],
    queryFn: async (): Promise<VirtualTryOnResult> => {
      if (!tryonId) {
        throw new Error('No tryon ID provided');
      }
      
      const response = await apiClient.get<VirtualTryOnResult>(
        `/virtual-tryon/${tryonId}?user_id=${userId}`
      );
      return response;
    },
    enabled: enabled && tryonId !== null,
    refetchInterval: (query) => {
      // Poll while processing, and also if completed but URL not yet set
      const data = query.state.data as VirtualTryOnResult | undefined;
      if (!data) return false;
      if (data.status === 'processing') return 2000;
      if (data.status === 'completed' && !data.result_image_url) return 2000;
      return false;
    },
    retry: false, // Don't retry on errors (404 = deleted)
  });
}

/**
 * Hook to fetch try-on history for the current user.
 * Returns all completed virtual try-ons, newest first.
 */
export function useTryOnHistory(userId: number, statusFilter?: 'completed' | 'processing' | 'failed') {
  return useQuery({
    queryKey: ['tryonHistory', userId, statusFilter],
    queryFn: async (): Promise<VirtualTryOnResult[]> => {
      const params = new URLSearchParams({
        user_id: userId.toString(),
      });
      
      if (statusFilter) {
        params.append('status_filter', statusFilter);
      }
      
      const response = await apiClient.get<VirtualTryOnResult[]>(
        `/virtual-tryon/?${params.toString()}`
      );
      return response;
    },
    enabled: userId > 0,
  });
}

/**
 * Hook for deleting a virtual try-on
 */
export function useDeleteTryOn() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { tryonId: number; userId: number }>({
    mutationFn: async ({ tryonId, userId }) => {
      console.log('🔄 Mutation executing delete for try-on:', tryonId);
      await apiClient.delete(`/virtual-tryon/${tryonId}?user_id=${userId}`);
    },
    retry: false, // Don't retry on failure (prevents double-delete)
    onSuccess: (_, variables) => {
      // Invalidate and refetch try-on history
      queryClient.invalidateQueries({ queryKey: ['tryonHistory', variables.userId] });
      console.log('✅ Try-on deleted and cache invalidated');
    },
    onError: (error: any) => {
      // Don't log 404 errors (item already deleted)
      if (error.status !== 404) {
        console.error('❌ Error deleting try-on:', error);
      } else {
        console.log('ℹ️ Try-on was already deleted (404)');
      }
    },
  });
}

/**
 * Hook to convert an image URI to base64
 */
export async function convertImageToBase64(imageUri: string): Promise<string> {
  try {
    // If it's already a base64 string, return it
    if (imageUri.startsWith('data:image')) {
      return imageUri.split(',')[1]; // Remove data:image/jpeg;base64, prefix
    }
    
    if (imageUri.startsWith('/9j/') || imageUri.startsWith('iVBOR')) {
      return imageUri; // Already base64
    }
    
    // Handle local file:// URIs directly (fetch can't read file://)
    if (imageUri.startsWith('file://')) {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: (FileSystem as any).EncodingType?.Base64 || 'base64',
      });
      return base64;
    }
    
    // Fetch the image and convert to base64
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove data:image/...;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ Error converting image to base64:', error);
    throw new Error('Failed to convert image to base64');
  }
}

/**
 * Hook to fetch try-on suggestions for a given item category
 * Returns compatible items from user's wardrobe
 */
export function useTryOnSuggestions(
  category: string | null,
  colors: string[] | null,
  userId: number,
  itemId?: number | null, // Optional: ID of selected item to extract tags from
  enabled: boolean = true
) {
  return useQuery<TryOnSuggestionsResponse>({
    queryKey: ['tryOnSuggestions', category, colors, userId, itemId],
    queryFn: async (): Promise<TryOnSuggestionsResponse> => {
      if (!category || !userId) {
        throw new Error('Category and userId are required');
      }
      
      const params = new URLSearchParams({
        category,
        user_id: userId.toString(),
      });
      
      // Add colors if provided
      if (colors && colors.length > 0) {
        params.append('colors', colors.join(','));
      }
      
      // Add item_id if provided (for tag extraction)
      if (itemId) {
        params.append('item_id', itemId.toString());
      }
      
      const response = await apiClient.get<TryOnSuggestionsResponse>(
        `/virtual-tryon/suggestions?${params.toString()}`
      );
      return response;
    },
    enabled: enabled && !!category && userId > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

