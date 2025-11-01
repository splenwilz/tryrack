/**
 * Custom hooks for wardrobe management
 * Provides React Query hooks for wardrobe operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

/**
 * AI-suggested metadata from Gemini
 */
export interface AISuggestions {
  title: string;
  category: string;  // Flexible category from Gemini (e.g., "denim jacket", "chinos", "sneaker")
  colors: string[];
  tags: string[];
}

/**
 * Wardrobe item type - matches backend model
 */
export interface WardrobeItem {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  category: string;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  price?: number;
  formality?: number;
  season?: string[];
  image_original?: string;
  image_clean?: string;
  status: 'clean' | 'worn' | 'dirty';
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';  // 🤖
  ai_suggestions?: AISuggestions;  // 🤖
  last_worn_at?: string;  // ISO datetime string
  wear_count?: number;  // Total number of times item has been worn
  created_at: string;
  updated_at?: string;
}

/**
 * Create wardrobe item request
 */
export interface CreateWardrobeItemRequest {
  title: string;
  description?: string;
  category: string;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  price?: number;
  formality?: number;
  season?: string[];
  image_original?: string;
  image_clean?: string;
}

/**
 * Update wardrobe item request
 */
export interface UpdateWardrobeItemRequest {
  title?: string;
  description?: string;
  category?: string;
  colors?: string[];
  sizes?: string[];
  tags?: string[];
  price?: number;
  formality?: number;
  season?: string[];
  image_original?: string;
  image_clean?: string;
  status?: 'clean' | 'worn' | 'dirty';
}

/**
 * Update wardrobe item status request
 */
export interface UpdateStatusRequest {
  status: 'clean' | 'worn' | 'dirty';
}

/**
 * Get wardrobe items hook
 * Fetches all wardrobe items for the current user with optional filters
 */
export const useWardrobeItems = (
  userId: number,
  filters?: {
    category?: string;
    status?: 'clean' | 'worn' | 'dirty';
    skip?: number;
    limit?: number;
  }
) => {
  const queryParams = new URLSearchParams();
  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.skip) queryParams.append('skip', filters.skip.toString());
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  queryParams.append('user_id', userId.toString());

  const endpoint = `/wardrobe/?${queryParams.toString()}`;

  return useQuery<WardrobeItem[]>({
    queryKey: ['wardrobe', userId, filters],
    queryFn: async () => {
      console.log('🔍 useWardrobeItems - Fetching wardrobe items...');
      const items = await apiClient.get<WardrobeItem[]>(endpoint);
      console.log('🔍 useWardrobeItems - API response:', items);
      return items;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!userId,
  });
};

/**
 * Get single wardrobe item hook
 */
export const useWardrobeItem = (itemId: number, userId: number) => {
  return useQuery<WardrobeItem>({
    queryKey: ['wardrobe', itemId, userId],
    queryFn: async () => {
      return apiClient.get<WardrobeItem>(`/wardrobe/${itemId}?user_id=${userId}`);
    },
    enabled: !!itemId && !!userId,
  });
};

/**
 * 🤖 Poll wardrobe item for AI processing updates
 * Auto-polls every 2 seconds while processing_status is 'pending' or 'processing'
 */
export const useWardrobeItemWithPolling = (itemId: number, userId: number) => {
  const query = useQuery<WardrobeItem>({
    queryKey: ['wardrobe', itemId, userId],
    queryFn: async () => {
      console.log('🤖 DEBUG: Polling item', itemId);
      try {
        const data = await apiClient.get<WardrobeItem>(`/wardrobe/${itemId}?user_id=${userId}`);
        console.log('🤖 DEBUG: Fetched data:', JSON.stringify(data).substring(0, 200));
        return data;
      } catch (error) {
        // 🛑 If item not found (404), stop polling gracefully
        const err = error as { status?: number; message?: string };
        if (err?.status === 404 || err?.message?.includes('404')) {
          console.log('🛑 DEBUG: Item not found (likely deleted), stopping poll');
          // Return null to stop polling (status will be undefined)
          return null as unknown as WardrobeItem;
        }
        // Re-throw other errors
        throw error;
      }
    },
    enabled: !!itemId && !!userId,
    retry: false, // Don't retry on errors (especially 404s)
    // 🔄 Poll every 2 seconds if still processing
    refetchInterval: (query) => {
      // Access data from the query state, not the callback parameter
      const status = query?.state?.data?.processing_status;
      const hasError = query?.state?.error;
      
      // Stop polling if there's an error (like 404) or if processing is complete
      if (hasError) {
        console.log('🛑 DEBUG: Stopping poll due to error');
        return false;
      }
      
      const shouldPoll = status === 'pending' || status === 'processing';
      console.log('🤖 DEBUG: Item status:', status, '| Polling:', shouldPoll);
      return shouldPoll ? 2000 : false;  // Poll every 2s or stop
    },
    refetchIntervalInBackground: false,  // Don't poll when app is in background
  });
  
  return query;
};

/**
 * 🎨 Process image immediately (NEW FLOW: before save)
 * Returns processing_id for polling
 */
export const useProcessImage = () => {
  return useMutation<
    { processing_id: number; image_original: string; processing_status: string },
    Error,
    { userId: number; image: string }
  >({
    mutationFn: async ({ userId, image }) => {
      console.log('🎨 DEBUG: Sending image for immediate processing');
      return apiClient.post<{ processing_id: number; image_original: string; processing_status: string }>(
        `/wardrobe/process-image?user_id=${userId}`,
        { image }
      );
    },
  });
};

/**
 * Create wardrobe item mutation
 */
export const useCreateWardrobeItem = () => {
  const queryClient = useQueryClient();

  return useMutation<WardrobeItem, Error, { userId: number; item: CreateWardrobeItemRequest }>({
    mutationFn: async ({ userId, item }) => {
      return apiClient.post<WardrobeItem>(`/wardrobe/?user_id=${userId}`, item);
    },
    onSuccess: () => {
      // Invalidate all wardrobe queries to refetch the list
      queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
    },
  });
};

/**
 * Update wardrobe item mutation
 */
export const useUpdateWardrobeItem = () => {
  const queryClient = useQueryClient();

  return useMutation<
    WardrobeItem,
    Error,
    { itemId: number; userId: number; item: UpdateWardrobeItemRequest }
  >({
    mutationFn: async ({ itemId, userId, item }) => {
      return apiClient.put<WardrobeItem>(`/wardrobe/${itemId}?user_id=${userId}`, item);
    },
    onSuccess: (data, variables) => {
      // Update the specific item in cache
      queryClient.setQueryData(['wardrobe', variables.itemId, variables.userId], data);
      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
    },
  });
};

/**
 * Update wardrobe item status mutation
 */
export const useUpdateWardrobeItemStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    WardrobeItem,
    Error,
    { itemId: number; userId: number; status: 'clean' | 'worn' | 'dirty' }
  >({
    mutationFn: async ({ itemId, userId, status }) => {
      return apiClient.patch<WardrobeItem>(
        `/wardrobe/${itemId}/status?user_id=${userId}`,
        { status }
      );
    },
    onSuccess: (data, variables) => {
      // Update the specific item in cache
      queryClient.setQueryData(['wardrobe', variables.itemId, variables.userId], data);
      // Invalidate list to refetch
      queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
    },
  });
};

/**
 * Batch update wardrobe items status mutation
 * Useful for marking multiple items (entire outfit) as worn at once
 */
export const useBatchUpdateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<
    {
      updated_items: WardrobeItem[];
      errors: string[] | null;
      total_updated: number;
      total_requested: number;
    },
    Error,
    { userId: number; itemIds: number[]; status: 'clean' | 'worn' | 'dirty' }
  >({
    mutationFn: async ({ userId, itemIds, status }) => {
      return apiClient.patch<{
        updated_items: WardrobeItem[];
        errors: string[] | null;
        total_updated: number;
        total_requested: number;
      }>(
        `/wardrobe/batch-status?user_id=${userId}`,
        { item_ids: itemIds, status }
      );
    },
    onSuccess: () => {
      // Invalidate all wardrobe queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
    },
  });
};

/**
 * Delete wardrobe item mutation
 */
export const useDeleteWardrobeItem = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, { itemId: number; userId: number }>({
    mutationFn: async ({ itemId, userId }) => {
      return apiClient.delete<{ message: string }>(`/wardrobe/${itemId}?user_id=${userId}`);
    },
    onSuccess: () => {
      // Invalidate wardrobe queries to refetch
      queryClient.invalidateQueries({ queryKey: ['wardrobe'] });
    },
  });
};

