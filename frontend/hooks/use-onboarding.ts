import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom hook to manage onboarding state
 * Handles checking if user has completed onboarding and navigation logic
 * 
 * @returns Object containing onboarding state and navigation functions
 */
export const useOnboarding = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  /**
   * Check if user has completed onboarding
   * Reads from AsyncStorage on app launch
   */
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
        setHasCompletedOnboarding(onboardingCompleted === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Default to showing onboarding if there's an error
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  /**
   * Mark onboarding as completed
   * Saves to AsyncStorage (navigation handled by root component)
   */
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      setHasCompletedOnboarding(true);
      // Navigation is handled by app/index.tsx to prevent race conditions
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still set state even if storage fails
      setHasCompletedOnboarding(true);
    }
  };

  /**
   * Reset onboarding status (useful for testing)
   * Removes from AsyncStorage
   */
  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('onboardingCompleted');
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  /**
   * Debug function to manually mark onboarding as completed
   * Useful for testing or fixing cases where onboarding wasn't properly saved
   */
  const markOnboardingCompleted = async () => {
    try {
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      setHasCompletedOnboarding(true);
      console.log('🔍 Onboarding Debug - Manually marked as completed');
    } catch (error) {
      console.error('🔍 Onboarding Debug - Error marking as completed:', error);
    }
  };

  return {
    isLoading,
    hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding,
    markOnboardingCompleted, // Add this for debugging
  };
};
