import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Authentication Context Types
 * Defines the shape of authentication state and methods
 * 
 * @see https://react-hook-form.com/ - Form validation library used
 * @see https://reactnative.dev/docs/asyncstorage - Persistent storage for auth state
 */
interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  socialSignIn: (provider: 'google' | 'facebook' | 'apple') => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 * 
 * Features:
 * - Persistent authentication state using AsyncStorage
 * - Social login support (Google, Facebook, Apple)
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
      
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation - replace with real API
      if (email === 'test@example.com' && password === 'password') {
        const userData: User = {
          id: '1',
          email,
          name: 'Test User',
        };
        
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true };
      } else {
        return { success: false, error: 'Invalid email or password' };
      }
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
  const signUp = async (email: string, password: string, confirmPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // Validate password confirmation
      if (password !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }
      
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user creation - replace with real API
      const userData: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0], // Use email prefix as name
      };
      
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
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
   * Social sign in (Google, Facebook, Apple)
   * Handles OAuth authentication with social providers
   * 
   * @param provider - Social provider ('google', 'facebook', 'apple')
   * @returns Promise with success status and optional error message
   */
  const socialSignIn = async (provider: 'google' | 'facebook' | 'apple'): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      // TODO: Implement actual social login
      // This is a mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData: User = {
        id: Date.now().toString(),
        email: `user@${provider}.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      };
      
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      return { success: false, error: `An error occurred during ${provider} sign in` };
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
      
      // TODO: Replace with actual API call
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock password reset - replace with real API
      console.log(`Password reset email sent to: ${email}`);
      
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'An error occurred during password reset' };
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    socialSignIn,
    resetPassword,
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
