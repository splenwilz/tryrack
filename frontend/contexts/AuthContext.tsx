import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGoogleOAuth, type OAuthResponse } from '@/hooks/useGoogleOAuth';
import { useAppleOAuth } from '@/hooks/useAppleOAuth';
import { API_CONFIG } from '@/constants/config';

/**
 * Authentication Context Types
 * Defines the shape of authentication state and methods
 * 
 * @see https://react-hook-form.com/ - Form validation library used
 * @see https://reactnative.dev/docs/asyncstorage - Persistent storage for auth state
 */
interface User {
  id: number; // Changed from string to number to match backend
  email: string;
  username: string; // Added username field from backend
  first_name?: string; // Added OAuth fields
  last_name?: string;
  profile_picture_url?: string;
  is_active: boolean; // Added from backend
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean; verificationData?: { email: string; pending_authentication_token: string } }>;
  signOut: () => Promise<void>;
  socialSignIn: (provider: 'google' | 'apple') => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (pendingToken: string, code: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 * 
 * Features:
 * - Persistent authentication state using AsyncStorage
 * - Social login support (Google, Apple)
 * - Password reset functionality
 * - Type-safe authentication methods
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth methods to child components
 * 
 * @param children - Child components that need access to auth context
 * @returns JSX element wrapping children with auth context
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize OAuth hooks
  // Based on our custom OAuth hook implementations
  const { signInWithGoogle, isLoading: googleOAuthLoading } = useGoogleOAuth();
  const { signInWithApple, isLoading: appleOAuthLoading } = useAppleOAuth();

  /**
   * Check for existing authentication on app launch
   * Reads stored auth data from AsyncStorage
   */
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  /**
   * Sign in with email and password
   * Validates credentials and stores user data
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with success status and optional error message
   */
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Call WorkOS authentication endpoint
      // Based on our WorkOS + FastAPI backend implementation
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Sign in failed' };
      }

      const data = await response.json();
      
      // Convert response to our User interface
      // Based on our backend User model structure
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        profile_picture_url: data.user.profile_picture_url,
        is_active: data.user.is_active,
      };
      
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Store access token for API calls
      // Based on JWT token handling best practices
      await AsyncStorage.setItem('access_token', data.access_token);
      
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'An error occurred during sign in' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign up with email and password
   * Creates new user account and stores user data
   * 
   * @param email - User's email address
   * @param password - User's password
   * @param confirmPassword - Password confirmation
   * @returns Promise with success status and optional error message
   */
  const signUp = async (email: string, password: string, confirmPassword: string): Promise<{ success: boolean; error?: string; requiresVerification?: boolean; verificationData?: { email: string; pending_authentication_token: string } }> => {
    try {
      setIsLoading(true);
      
      console.log('🔍 Sign Up Debug - Starting sign up process');
      console.log('🔍 Sign Up Debug - Email:', email);
      console.log('🔍 Sign Up Debug - Password length:', password.length);
      console.log('🔍 Sign Up Debug - API_CONFIG.BASE_URL:', API_CONFIG.BASE_URL);
      console.log('🔍 Sign Up Debug - API_CONFIG.API_VERSION:', API_CONFIG.API_VERSION);
      
      // Validate password confirmation
      if (password !== confirmPassword) {
        console.log('🔍 Sign Up Debug - Password mismatch');
        return { success: false, error: 'Passwords do not match' };
      }
      
      const requestUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/auth/signup`;
      console.log('🔍 Sign Up Debug - Request URL:', requestUrl);
      
      const requestBody = {
        email,
        password,
      };
      console.log('🔍 Sign Up Debug - Request body:', { email, password: '[HIDDEN]' });
      
      console.log('🔍 Sign Up Debug - Making fetch request...');
      const requestStartTime = Date.now();
      
      // Test basic connectivity first
      console.log('🔍 Sign Up Debug - Testing basic connectivity...');
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const testResponse = await fetch(`${API_CONFIG.BASE_URL}/api/v1/`, {
          method: 'GET',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        console.log('🔍 Sign Up Debug - Test response status:', testResponse.status);
        const testData = await testResponse.text();
        console.log('🔍 Sign Up Debug - Test response data:', testData);
      } catch (testError) {
        console.error('🔍 Sign Up Debug - Test connectivity failed:', testError);
      }
      
      // Call WorkOS sign up endpoint
      // Based on our WorkOS + FastAPI backend implementation
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const requestEndTime = Date.now();
      console.log('🔍 Sign Up Debug - Request completed in:', requestEndTime - requestStartTime, 'ms');
      console.log('🔍 Sign Up Debug - Response status:', response.status);
      console.log('🔍 Sign Up Debug - Response ok:', response.ok);
      console.log('🔍 Sign Up Debug - Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.log('🔍 Sign Up Debug - Response not ok, reading error data...');
        const errorData = await response.json();
        console.log('🔍 Sign Up Debug - Error data:', errorData);
        return { success: false, error: errorData.detail || 'Sign up failed' };
      }

      console.log('🔍 Sign Up Debug - Reading response data...');
      const data = await response.json();
      console.log('🔍 Sign Up Debug - Response data:', data);
      console.log('🔍 Sign Up Debug - Response data type:', typeof data);
      console.log('🔍 Sign Up Debug - Response data keys:', Object.keys(data));
      
      // Check if email verification is required
      // Based on WorkOS email verification flow
      if (data.message?.includes('verification')) {
        console.log('🔍 Sign Up Debug - Verification required detected');
        return {
          success: true,
          requiresVerification: true,
          verificationData: {
            email: data.email,
            pending_authentication_token: data.pending_authentication_token,
          }
        };
      }
      
      console.log('🔍 Sign Up Debug - No verification required, proceeding with normal flow');
      
      // If no verification required, proceed with normal flow
      // Convert response to our User interface
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        profile_picture_url: data.user.profile_picture_url,
        is_active: data.user.is_active,
      };
      
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Store access token for API calls
      await AsyncStorage.setItem('access_token', data.access_token);
      
      return { success: true };
    } catch (error) {
      console.error('🔍 Sign Up Debug - Error caught:', error);
      console.error('🔍 Sign Up Debug - Error type:', typeof error);
      console.error('🔍 Sign Up Debug - Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('🔍 Sign Up Debug - Error stack:', error instanceof Error ? error.stack : 'No stack');
      return { success: false, error: 'An error occurred during sign up' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out user
   * Clears user data and authentication state
   */
  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Social sign in (Google, Apple)
   * Handles OAuth authentication with social providers
   * 
   * @param provider - Social provider ('google', 'apple')
   * @returns Promise with success status and optional error message
   */
  const socialSignIn = async (provider: 'google' | 'apple'): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Handle OAuth authentication based on provider
      // Based on our WorkOS + FastAPI backend implementation
      let oauthResult: OAuthResponse | null = null;
      
      if (provider === 'google') {
        oauthResult = await signInWithGoogle();
      } else if (provider === 'apple') {
        oauthResult = await signInWithApple();
      } else {
        return { success: false, error: `${provider} OAuth not supported` };
      }
      
      if (oauthResult) {
        // Convert OAuthUser to our User interface
        // Based on our backend User model structure
        const userData: User = {
          id: oauthResult.user.id,
          email: oauthResult.user.email,
          username: oauthResult.user.username,
          first_name: oauthResult.user.first_name,
          last_name: oauthResult.user.last_name,
          profile_picture_url: oauthResult.user.profile_picture_url,
          is_active: oauthResult.user.is_active,
        };
        
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        // Store access token for API calls
        // Based on JWT token handling best practices
        await AsyncStorage.setItem('access_token', oauthResult.access_token);
        
        return { success: true };
      } else {
        return { success: false, error: `${provider} OAuth authentication cancelled` };
      }
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      return { success: false, error: error instanceof Error ? error.message : `An error occurred during ${provider} sign in` };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset password
   * Sends password reset email to user
   * 
   * @param email - User's email address
   * @returns Promise with success status and optional error message
   */
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Call WorkOS password reset endpoint
      // Based on our WorkOS + FastAPI backend implementation
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Failed to send reset email' };
      }

      const data = await response.json();
      console.log('Password reset email sent:', data.message);
      
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'An error occurred during password reset' };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify email with verification code
   * Completes the email verification process with WorkOS
   * 
   * @param pendingToken - Pending authentication token from sign-up
   * @param code - Verification code from email
   * @returns Promise with success status and optional error message
   */
  const verifyEmail = async (pendingToken: string, code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Call WorkOS email verification endpoint
      // Based on our WorkOS + FastAPI backend implementation
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pending_authentication_token: pendingToken,
          code: code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Email verification failed' };
      }

      const data = await response.json();
      
      // Convert response to our User interface
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        profile_picture_url: data.user.profile_picture_url,
        is_active: data.user.is_active,
      };
      
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Store access token for API calls
      await AsyncStorage.setItem('access_token', data.access_token);
      
      return { success: true };
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'An error occurred during email verification' };
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading: isLoading || googleOAuthLoading || appleOAuthLoading, // Include OAuth loading state
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    socialSignIn,
    resetPassword,
    verifyEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use authentication context
 * Provides type-safe access to auth state and methods
 * 
 * @returns Authentication context value
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
