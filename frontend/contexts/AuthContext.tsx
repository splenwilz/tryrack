/**
 * Authentication Context for WorkOS AuthKit integration
 * Based on WorkOS documentation: https://workos.com/docs/authkit/react/python
 */

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { WORKOS_CONFIG } from '../config/workos';

// Configure WebBrowser for better UX
WebBrowser.maybeCompleteAuthSession();

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  /**
   * Check authentication status by calling the backend /auth/me endpoint
   * Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/protected-routes
   */
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Make request to backend to check if user is authenticated
      const response = await fetch(`${WORKOS_CONFIG.BACKEND_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include', // Include cookies for session management
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initiate sign in by redirecting to WorkOS AuthKit
   * Reference: https://workos.com/docs/authkit/react/python/2-add-authkit-to-your-app/add-a-login-endpoint
   */
  const signIn = async () => {
    try {
      setIsLoading(true);
      
      // Redirect to backend login endpoint which will redirect to WorkOS
      const loginUrl = `${WORKOS_CONFIG.BACKEND_URL}/auth/login`;
      
      // Use WebBrowser to open the login URL
      const result = await WebBrowser.openAuthSessionAsync(
        loginUrl,
        WORKOS_CONFIG.FRONTEND_URL, // Redirect URL after authentication
        {
          showInRecents: true,
        }
      );

      if (result.type === 'success') {
        // Authentication was successful, check auth status
        await checkAuthStatus();
      } else {
        console.log('Authentication cancelled or failed');
      }
    } catch (error) {
      console.error('Error during sign in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out by calling the backend logout endpoint
   * Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/ending-the-session
   */
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Call backend logout endpoint
      const response = await fetch(`${WORKOS_CONFIG.BACKEND_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        setUser(null);
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if logout fails on backend, clear local state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on app startup
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle deep linking for authentication callbacks
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      // Check if this is an authentication callback
      if (url.includes('callback') || url.includes('auth')) {
        checkAuthStatus();
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => subscription?.remove();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
