import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { decode as base64Decode } from 'base-64';

/**
 * Secure Storage Utility
 * Provides secure storage for sensitive authentication data and PII using expo-secure-store
 * Falls back to AsyncStorage only for web platform compatibility
 * 
 * SECURITY: All user data (email, username, names) is encrypted using platform-specific secure storage
 * - iOS: Keychain Services
 * - Android: EncryptedSharedPreferences
 * - Web: AsyncStorage (less secure but necessary for web compatibility)
 * 
 * @see https://docs.expo.dev/versions/latest/sdk/securestore/ - Official Expo SecureStore documentation
 * @see https://github.com/expo/expo/blob/main/docs/pages/guides/authentication.mdx - Authentication best practices
 */

/**
 * Decodes base64url encoded JWT payload
 * Handles React Native compatibility and proper base64url decoding
 * 
 * @param b64url - Base64url encoded string
 * @returns Decoded JSON string
 */
function base64UrlToJson(b64url: string): string {
  // Convert base64url to base64
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if necessary
  while (b64.length % 4) {
    b64 += '=';
  }
  
  // Use platform-appropriate decoder
  if (Platform.OS === 'web') {
    return atob(b64);
  } else {
    return base64Decode(b64);
  }
}

// Storage keys for different types of data
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'secure_access_token',
  REFRESH_TOKEN: 'secure_refresh_token', // For future token refresh implementation
  USER_DATA: 'secure_user_data', // Sensitive user profile data (PII)
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
 * Stores user profile data securely
 * User profile data contains PII (email, username, names) and must be encrypted
 * 
 * @param userData - User profile object containing PII
 * @returns Promise that resolves when data is stored
 */
export async function storeUserData(userData: object): Promise<void> {
  await setSecureItem(STORAGE_KEYS.USER_DATA, userData);
}

/**
 * Retrieves stored user profile data securely
 * 
 * @returns Promise that resolves with user data or null
 */
export async function getUserData(): Promise<object | null> {
  try {
    const userData = await getSecureItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Removes stored user profile data securely
 * Called during logout to clear user state
 * 
 * @returns Promise that resolves when data is removed
 */
export async function removeUserData(): Promise<void> {
  await removeSecureItem(STORAGE_KEYS.USER_DATA);
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
 * Performs comprehensive JWT validation including expiration check
 * Automatically clears expired tokens to prevent authentication issues
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
    
    // Validate JWT format
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('🔍 SecureStorage Debug - Invalid token format');
      return false;
    }
    
    // Decode JWT payload to check expiration
    try {
      const payload = JSON.parse(base64UrlToJson(parts[1]));
      console.log('🔍 SecureStorage Debug - Token payload decoded');
      
      // Check if token has expiration claim
      if (!payload.exp) {
        console.warn('🔍 SecureStorage Debug - Token missing expiration claim');
        return false;
      }
      
      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      const expirationTime = payload.exp;
      const timeRemaining = expirationTime - currentTime;
      
      if (currentTime >= expirationTime) {
        const expiredSecondsAgo = currentTime - expirationTime;
        console.warn('🔍 Token Expiration Debug - Access token EXPIRED');
        console.warn(`🔍 Token Expiration Debug - Expired ${expiredSecondsAgo} seconds ago`);
        console.log('🔍 Token Expiration Debug - Current time:', new Date(currentTime * 1000).toISOString());
        console.log('🔍 Token Expiration Debug - Expiration time:', new Date(expirationTime * 1000).toISOString());
        
        // Check if refresh token exists - if so, keep it for token refresh when connection returns
        // This allows seamless re-authentication (token lifetime configured in backend, default: 7 days) even after temporary disconnections
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          console.log('✅ Token Expiration Debug - Refresh token available! Token will auto-refresh on next API call');
          console.log('✅ Token Expiration Debug - User stays logged in (refresh token lifetime configured in backend)');
          // Don't clear data - keep refresh token for when connection is restored
          // API client will handle refresh automatically when making requests
          return false; // Token is expired but refresh token is available (lifetime configured in backend)
        } else {
          console.warn('❌ Token Expiration Debug - No refresh token, clearing stored data');
          // Only clear if we truly have no way to refresh (no refresh token)
          await clearAllAuthData();
          return false;
        }
      }
      
      // Token is still valid - log time remaining
      if (timeRemaining < 60) {
        console.warn(`🔍 Token Expiration Debug - Token expires in ${timeRemaining} seconds (less than 1 minute!)`);
      } else if (timeRemaining < 300) {
        console.warn(`🔍 Token Expiration Debug - Token expires in ${Math.floor(timeRemaining / 60)} minutes`);
      } else {
        console.log(`🔍 Token Expiration Debug - Token valid, expires in ${Math.floor(timeRemaining / 60)} minutes`);
      }
      console.log('🔍 Token Expiration Debug - Token is valid and not expired');
      return true;
    } catch (decodeError) {
      console.error('🔍 SecureStorage Debug - Error decoding token:', decodeError);
      return false;
    }
  } catch (error) {
    console.error('🔍 SecureStorage Debug - Error validating token:', error);
    return false;
  }
}
