import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

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
   * 
   * DISABLED FOR TESTING: Always show onboarding screen
   */
  useEffect(() => {
    // DISABLED FOR TESTING - Always show onboarding
    // const checkOnboardingStatus = async () => {
    //   try {
    //     const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
    //     setHasCompletedOnboarding(onboardingCompleted === 'true');
    //   } catch (error) {
    //     console.error('Error checking onboarding status:', error);
    //     // Default to showing onboarding if there's an error
    //     setHasCompletedOnboarding(false);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

    // checkOnboardingStatus();
    
    // FOR TESTING: Always show onboarding screen
    setHasCompletedOnboarding(false);
    setIsLoading(false);
  }, []);

  /**
   * Mark onboarding as completed
   * Saves to AsyncStorage and navigates to main app
   * 
   * DISABLED FOR TESTING: Just navigate without saving
   */
  const completeOnboarding = async () => {
    // DISABLED FOR TESTING - Don't save to AsyncStorage
    // try {
    //   await AsyncStorage.setItem('onboardingCompleted', 'true');
    //   setHasCompletedOnboarding(true);
    //   // Use setTimeout to avoid navigation during render
    //   setTimeout(() => {
    //     router.replace('/(tabs)');
    //   }, 100);
    // } catch (error) {
    //   console.error('Error completing onboarding:', error);
    //   // Still navigate even if storage fails
    //   setTimeout(() => {
    //     router.replace('/(tabs)');
    //   }, 100);
    // }

    // FOR TESTING: Just navigate without saving
    console.log('Onboarding completed (testing mode)');
    setHasCompletedOnboarding(true);
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 100);
  };

  /**
   * Reset onboarding status (useful for testing)
   * Removes from AsyncStorage
   * 
   * DISABLED FOR TESTING: No-op function
   */
  const resetOnboarding = async () => {
    // DISABLED FOR TESTING - Don't interact with AsyncStorage
    // try {
    //   await AsyncStorage.removeItem('onboardingCompleted');
    //   setHasCompletedOnboarding(false);
    // } catch (error) {
    //   console.error('Error resetting onboarding:', error);
    // }

    // FOR TESTING: Just reset state
    console.log('Onboarding reset (testing mode)');
    setHasCompletedOnboarding(false);
  };

  return {
    isLoading,
    hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
};
