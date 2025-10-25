import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * Secure Storage Utility
 * Provides secure storage for sensitive authentication data using expo-secure-store
 * Falls back to AsyncStorage for non-sensitive data and web platform
 * 
 * @see https://docs.expo.dev/versions/latest/sdk/securestore/ - Official Expo SecureStore documentation
 * @see https://github.com/expo/expo/blob/main/docs/pages/guides/authentication.mdx - Authentication best practices
 */

// Storage keys for different types of data
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'secure_access_token',
  REFRESH_TOKEN: 'secure_refresh_token', // For future token refresh implementation
  USER_DATA: 'user_data', // Non-sensitive user profile data
} as const;

/**
 * Securely stores sensitive authentication data
 * Uses expo-secure-store on native platforms, AsyncStorage on web
 * 
 * @param key - Storage key identifier
 * @param value - Value to store (will be stringified if object)
 * @returns Promise that resolves when storage is complete
 */
export async function setSecureItem(key: string, value: string | object): Promise<void> {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (Platform.OS === 'web') {
      // Web platform fallback to AsyncStorage
      // Note: This is less secure but necessary for web compatibility
      await AsyncStorage.setItem(key, stringValue);
    } else {
      // Native platforms use secure storage
      await SecureStore.setItemAsync(key, stringValue);
    }
  } catch (error) {
    console.error(`Error storing secure item ${key}:`, error);
    throw new Error(`Failed to store secure data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieves sensitive authentication data from secure storage
 * Uses expo-secure-store on native platforms, AsyncStorage on web
 * 
 * @param key - Storage key identifier
 * @returns Promise that resolves with stored value or null
 */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      // Web platform fallback to AsyncStorage
      return await AsyncStorage.getItem(key);
    } else {
      // Native platforms use secure storage
      return await SecureStore.getItemAsync(key);
    }
  } catch (error) {
    console.error(`Error retrieving secure item ${key}:`, error);
    return null;
  }
}

/**
 * Removes sensitive authentication data from secure storage
 * Uses expo-secure-store on native platforms, AsyncStorage on web
 * 
 * @param key - Storage key identifier
 * @returns Promise that resolves when removal is complete
 */
export async function removeSecureItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      // Web platform fallback to AsyncStorage
      await AsyncStorage.removeItem(key);
    } else {
      // Native platforms use secure storage
      await SecureStore.deleteItemAsync(key);
    }
  } catch (error) {
    console.error(`Error removing secure item ${key}:`, error);
    throw new Error(`Failed to remove secure data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Stores access token securely
 * Access tokens are sensitive and must be stored securely
 * 
 * @param token - JWT access token
 * @returns Promise that resolves when token is stored
 */
export async function storeAccessToken(token: string): Promise<void> {
  await setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, token);
}

/**
 * Retrieves stored access token
 * 
 * @returns Promise that resolves with access token or null
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    console.log('🔍 SecureStorage Debug - Getting access token');
    const token = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
    console.log('🔍 SecureStorage Debug - Access token retrieved:', token ? 'exists' : 'null');
    return token;
  } catch (error) {
    console.error('🔍 SecureStorage Debug - Error getting access token:', error);
    return null;
  }
}

/**
 * Removes stored access token
 * Called during logout to clear authentication state
 * 
 * @returns Promise that resolves when token is removed
 */
export async function removeAccessToken(): Promise<void> {
  await removeSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Stores refresh token securely
 * Refresh tokens are sensitive and must be stored securely
 * 
 * @param token - JWT refresh token
 * @returns Promise that resolves when token is stored
 */
export async function storeRefreshToken(token: string): Promise<void> {
  await setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, token);
}

/**
 * Retrieves stored refresh token
 * 
 * @returns Promise that resolves with refresh token or null
 */
export async function getRefreshToken(): Promise<string | null> {
  return await getSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Removes stored refresh token
 * Called during logout to clear authentication state
 * 
 * @returns Promise that resolves when token is removed
 */
export async function removeRefreshToken(): Promise<void> {
  await removeSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Stores user profile data
 * User profile data is non-sensitive and can use AsyncStorage
 * 
 * @param userData - User profile object
 * @returns Promise that resolves when data is stored
 */
export async function storeUserData(userData: object): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
}

/**
 * Retrieves stored user profile data
 * 
 * @returns Promise that resolves with user data or null
 */
export async function getUserData(): Promise<object | null> {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Removes stored user profile data
 * Called during logout to clear user state
 * 
 * @returns Promise that resolves when data is removed
 */
export async function removeUserData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
}

/**
 * Clears all authentication data
 * Comprehensive cleanup for logout functionality
 * 
 * @returns Promise that resolves when all data is cleared
 */
export async function clearAllAuthData(): Promise<void> {
  try {
    // Clear all secure tokens
    await Promise.all([
      removeAccessToken(),
      removeRefreshToken(),
      removeUserData(),
    ]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw new Error(`Failed to clear authentication data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates if a stored access token exists and is not expired
 * Basic token validation - in production, you might want to decode and check expiration
 * 
 * @returns Promise that resolves with validation result
 */
export async function validateStoredToken(): Promise<boolean> {
  try {
    console.log('🔍 SecureStorage Debug - Validating stored token');
    const token = await getAccessToken();
    console.log('🔍 SecureStorage Debug - Token exists:', !!token);
    
    if (!token) {
      console.log('🔍 SecureStorage Debug - No token found');
      return false;
    }
    
    // Basic token validation - check if it's a valid JWT format
    // In production, you might want to decode the token and check expiration
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('🔍 SecureStorage Debug - Invalid token format');
      return false;
    }
    
    console.log('🔍 SecureStorage Debug - Token format valid');
    return true;
  } catch (error) {
    console.error('🔍 SecureStorage Debug - Error validating token:', error);
    return false;
  }
}
