// Environment configuration for WorkOS AuthKit
// Reference: https://workos.com/docs/authkit/react/python

export const WORKOS_CONFIG = {
  // Get these from your WorkOS Dashboard: https://dashboard.workos.com/api-keys
  CLIENT_ID: 'client_01K86PVP3MEA1X2WZDKQYQP7HW', // From backend .env file
  
  // Backend API URL
  BACKEND_URL: 'http://localhost:8000',
  
  // Redirect URIs configured in WorkOS Dashboard
  REDIRECT_URI: 'http://localhost:8000/auth/callback',
  
  // Frontend URL for redirects after authentication
  FRONTEND_URL: 'http://localhost:8081',
};

// For Expo development, we need to handle deep linking
export const EXPO_CONFIG = {
  // Expo development server URL
  EXPO_URL: 'exp://localhost:19000',
  
  // Deep link scheme for authentication
  SCHEME: 'tryrack',
};
