/**
 * Custom hook for style insights
 * Provides React Query hook for fetching user style analytics
 */

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiClient } from '@/lib/api';

/**
 * Style insights response - matches backend schema
 */
export interface StyleInsights {
  style_preferences: Record<string, number>;  // Style keyword -> percentage
  color_palette: Array<{ color: string; percentage: number }>;
  category_distribution: Record<string, number>;  // Category -> percentage
  average_formality: number;  // 0-100
  style_evolution: {
    recent_period: string;
    previous_period: string;
    changes: Record<string, {
      recent_percentage: number;
      previous_percentage: number;
      change: number;
      trend: 'up' | 'down' | 'stable';
    }>;
  } | null;
}

/**
 * React Query hook for fetching style insights
 * 
 * @returns Query result with style insights data
 */
export function useStyleInsights() {
  const query = useQuery<StyleInsights>({
    queryKey: ['style-insights'],
    queryFn: async () => {
      if (__DEV__) {
        console.log('📊 [useStyleInsights] ⚡ HOOK CALLED - Fetching from API: /style-insights/');
      }
      try {
        const data = await apiClient.get<StyleInsights>('/style-insights/');
        if (__DEV__) {
          console.log('📊 [useStyleInsights] API SUCCESS - Full response:', JSON.stringify(data, null, 2));
          console.log('📊 [useStyleInsights] Style preferences keys:', Object.keys(data.style_preferences || {}));
          console.log('📊 [useStyleInsights] Style preferences values:', Object.entries(data.style_preferences || {}));
          console.log('📊 [useStyleInsights] Color palette:', data.color_palette);
          console.log('📊 [useStyleInsights] Average formality:', data.average_formality);
        }
        // Validate that we got real data, not empty/cached
        if (!data || (Object.keys(data.style_preferences || {}).length === 0 && data.color_palette?.length === 0)) {
          if (__DEV__) {
            console.warn('⚠️ [useStyleInsights] Received empty data - this might be why you see no insights');
          }
        }
        return data;
      } catch (error: unknown) {
        if (__DEV__) {
          console.error('❌ [useStyleInsights] API ERROR:', error);
          const err = error as { message?: string; status?: number; statusText?: string; data?: unknown };
          console.error('❌ [useStyleInsights] Error details:', {
            message: err?.message,
            status: err?.status,
            statusText: err?.statusText,
            data: err?.data
          });
        }
        throw error;
      }
    },
    staleTime: 0, // Always fetch fresh data for debugging
    gcTime: 0, // Don't cache for debugging
    retry: 1,
    enabled: true, // Explicitly enable the query
  });
  
  // Log query state
  useEffect(() => {
    if (__DEV__) {
      console.log('📊 [useStyleInsights] Query state:', {
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        isError: query.isError,
        hasData: !!query.data,
        error: query.error
      });
    }
  }, [query.isLoading, query.isFetching, query.isError, query.data, query.error]);
  
  return query;
}

