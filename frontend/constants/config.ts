/**
 * Environment Configuration
 * Centralized configuration for API endpoints and external services
 * 
 * Based on Expo environment variable best practices:
 * https://docs.expo.dev/guides/environment-variables/
 */

// API Configuration
export const API_CONFIG = {
  // Backend API base URL
  // In development, use the same IP as Expo dev server
  // In production, use your deployed backend URL
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL, 
  // API version prefix
  API_VERSION: '/api/v1',
  
  // OAuth endpoints
  OAUTH_CALLBACK: '/auth/oauth/callback',
} as const;

// Debug logging for config
console.log('🔍 Config Debug - API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
console.log('🔍 Config Debug - API_CONFIG.API_VERSION:', API_CONFIG.API_VERSION);
console.log('🔍 Config Debug - __DEV__:', __DEV__);
console.log('🔍 Config Debug - process.env.EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL);

// WorkOS Configuration
export const WORKOS_CONFIG = {
  // WorkOS API base URL
  API_BASE_URL: 'https://api.workos.com',
  
  // OAuth authorization endpoint
  AUTHORIZE_ENDPOINT: '/user_management/authorize',
  
  // Client ID - from environment variables
  CLIENT_ID: process.env.EXPO_PUBLIC_WORKOS_CLIENT_ID || 'client_01K86PVP3MEA1X2WZDKQYQP7HW',
  
  // OAuth providers
  PROVIDERS: {
    GOOGLE: 'GoogleOAuth',
    APPLE: 'AppleOAuth',
  },
} as const;

// OAuth Configuration
export const OAUTH_CONFIG = {
  // Redirect URI scheme for mobile app
  REDIRECT_SCHEME: process.env.EXPO_PUBLIC_OAUTH_REDIRECT_SCHEME || 'frontend',
  REDIRECT_PATH: process.env.EXPO_PUBLIC_OAUTH_REDIRECT_PATH || 'auth/callback',
  
  // Response type for OAuth flow
  RESPONSE_TYPE: 'code',
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}${endpoint}`;
};

// Helper function to get WorkOS authorization URL
export const getWorkOSAuthUrl = (provider: string, redirectUri: string, state: string): string => {
  const params = new URLSearchParams({
    response_type: OAUTH_CONFIG.RESPONSE_TYPE,
    client_id: WORKOS_CONFIG.CLIENT_ID,
    redirect_uri: redirectUri,
    provider: provider,
    state: state,
  });
  
  return `${WORKOS_CONFIG.API_BASE_URL}${WORKOS_CONFIG.AUTHORIZE_ENDPOINT}?${params.toString()}`;
};
