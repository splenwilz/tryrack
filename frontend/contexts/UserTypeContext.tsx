import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// User type definitions based on blueprint requirements
export type UserType = 'individual' | 'boutique';

interface UserTypeContextType {
  userType: UserType | null;
  isLoading: boolean;
  setUserType: (type: UserType) => Promise<void>;
  clearUserType: () => Promise<void>;
  isOnboardingComplete: boolean;
  resetForDevelopment: () => Promise<void>; // For development - reset everything
}

const UserTypeContext = createContext<UserTypeContextType | undefined>(undefined);

const USER_TYPE_STORAGE_KEY = 'user_type';
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

/**
 * UserTypeContext - Manages user type (individual vs boutique) and onboarding state
 * 
 * DEVELOPMENT NOTE: 
 * - Onboarding is set to always show for development purposes
 * - Use resetForDevelopment() to clear all stored data
 * - In production, uncomment the onboarding completion logic
 * 
 * Based on blueprint requirements for role-based access and different user experiences
 */
export const UserTypeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userType, setUserTypeState] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  const loadUserType = useCallback(async () => {
    try {
      const storedUserType = await AsyncStorage.getItem(USER_TYPE_STORAGE_KEY);
      const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      
      if (storedUserType) {
        setUserTypeState(storedUserType as UserType);
      }
      
      // Check if onboarding was previously completed (for non-development mode)
      if (onboardingComplete === 'true') {
        setIsOnboardingComplete(true);
      }
    } catch (error) {
      console.error('Error loading user type:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setUserType = useCallback(async (type: UserType) => {
    try {
      await AsyncStorage.setItem(USER_TYPE_STORAGE_KEY, type);
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setUserTypeState(type);
      setIsOnboardingComplete(true);
    } catch (error) {
      console.error('Error saving user type:', error);
    }
  }, []);

  const resetForDevelopment = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(USER_TYPE_STORAGE_KEY),
        AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY)
      ]);
      setUserTypeState(null);
      setIsOnboardingComplete(false);
      console.log('Development reset complete - onboarding will show on next app start');
    } catch (error) {
      console.error('Error resetting for development:', error);
    }
  }, []);

  const clearUserType = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(USER_TYPE_STORAGE_KEY),
        AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY)
      ]);
      setUserTypeState(null);
      setIsOnboardingComplete(false);
    } catch (error) {
      console.error('Error clearing user type:', error);
    }
  }, []);

  // Load user type on mount
  useEffect(() => {
    loadUserType();
  }, [loadUserType]);

  const value: UserTypeContextType = {
    userType,
    isLoading,
    setUserType,
    clearUserType,
    isOnboardingComplete,
    resetForDevelopment
  };

  return (
    <UserTypeContext.Provider value={value}>
      {children}
    </UserTypeContext.Provider>
  );
};

/**
 * Hook to use UserType context
 * Provides access to user type state and methods
 */
export const useUserType = (): UserTypeContextType => {
  const context = useContext(UserTypeContext);
  if (context === undefined) {
    throw new Error('useUserType must be used within a UserTypeProvider');
  }
  return context;
};
