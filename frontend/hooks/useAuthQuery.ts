/**
 * Custom hooks for authentication queries
 * Provides React Query hooks for auth-related operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { apiClient } from '@/lib/api';

/**
 * User type definition
 */
export interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  is_active: boolean;
  profile_completed?: boolean;
  gender?: 'male' | 'female';
  height?: number;
  weight?: number;
  full_body_image_url?: string;
  user_type?: 'individual' | 'boutique';
  clothing_sizes?: Record<string, string>; // Flexible JSON for gender-specific sizes
}

/**
 * Signup request type
 */
export interface SignupRequest {
  email: string;
  password: string;
  username: string;
}

/**
 * Signin request type
 */
export interface SigninRequest {
  email: string;
  password: string;
}

/**
 * Profile completion type
 */
export interface ProfileCompletion {
  gender?: 'male' | 'female';
  height?: number;
  weight?: number;
  clothing_sizes?: Record<string, string>; // Flexible JSON for gender-specific sizes
  profile_picture_url?: string;
  full_body_image_url?: string;
}

/**
 * Hook to get current user
 * Refetches on mount and network reconnect
 */
export const useUser = () => {
  return useQuery<User>({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      console.log('🔍 useUser - Fetching current user from API...');
      const user = await apiClient.get<User>('/users/current');
      console.log('🔍 useUser - API response:', user);
      return user;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    // Don't retry on 401 (unauthorized) errors
    retryOnMount: true,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: false, // Don't throw on auth errors
  });
};

/**
 * Hook for user signup
 * Invalidates auth queries on success
 */
export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, SignupRequest>({
    mutationFn: async (data: SignupRequest) => {
      return apiClient.post<User>('/auth/signup', data);
    },
    onSuccess: () => {
      // Invalidate auth queries to refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
};

/**
 * Hook for user signin
 * Invalidates auth queries on success
 */
export const useSignin = () => {
  const queryClient = useQueryClient();

  return useMutation<{ access_token: string; user: User }, Error, SigninRequest>({
    mutationFn: async (data: SigninRequest) => {
      return apiClient.post<{ access_token: string; user: User }>('/auth/signin', data);
    },
    onSuccess: () => {
      // Invalidate auth queries to refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
};

/**
 * Hook for email verification
 */
export const useVerifyEmail = () => {
  return useMutation<
    { message: string; pending_authentication_token: string },
    Error,
    { email: string; code: string }
  >({
    mutationFn: async (data) => {
      return apiClient.post('/auth/verify-email', data);
    },
  });
};

/**
 * Hook for completing user profile
 * Updates user cache on success
 */
export const useCompleteProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { userId: number; profileData: ProfileCompletion }>({
    mutationFn: async ({ userId, profileData }) => {
      return apiClient.put<User>(`/users/${userId}/profile`, profileData);
    },
    onSuccess: (data, variables) => {
      // Update user cache with new profile data
      queryClient.setQueryData(queryKeys.auth.user(), data);
      queryClient.invalidateQueries({ queryKey: ['users', variables.userId] });
    },
  });
};

/**
 * Hook for updating user type
 * Updates user cache on success
 */
export const useUpdateUserType = () => {
  const queryClient = useQueryClient();

  return useMutation<User, Error, { userId: number; userType: 'individual' | 'boutique' }>({
    mutationFn: async ({ userId, userType }) => {
      return apiClient.put<User>(`/users/${userId}/user-type?user_type=${userType}`, {});
    },
    onSuccess: (data) => {
      // Update user cache with new user type
      queryClient.setQueryData(queryKeys.auth.user(), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
};

