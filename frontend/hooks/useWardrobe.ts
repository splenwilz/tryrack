/**
 * Custom hooks for wardrobe management
 * Provides React Query hooks for wardrobe operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

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

