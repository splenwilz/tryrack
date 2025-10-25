import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuth } from '@/contexts/AuthContext';
import OnboardingScreenComponent from './onboarding';
import { router } from 'expo-router';

/**
 * Root Index Component
 * Handles initial app navigation based on authentication and onboarding status
 * 
 * Features:
 * - Shows loading screen while checking authentication and onboarding status
 * - Redirects to sign-in if not authenticated
 * - Redirects to onboarding if authenticated but onboarding not completed
 * - Redirects to main app if authenticated and onboarding completed
 * - Handles navigation state management
 */
export default function Index() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { isLoading: onboardingLoading, hasCompletedOnboarding } = useOnboarding();

  const isLoading = authLoading || onboardingLoading;

  // Handle navigation based on authentication and onboarding status
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        if (hasCompletedOnboarding) {
          // User not authenticated but onboarding completed, go to sign-in
          router.replace('/auth/sign-in');
        } else {
          // User not authenticated and onboarding not completed, show onboarding
          // Don't navigate here, just show onboarding screen
        }
      } else if (!hasCompletedOnboarding) {
        // User authenticated but onboarding not completed, show onboarding
        // Don't navigate here, just show onboarding screen
      } else {
        // User authenticated and onboarding completed, go to main app
        router.replace('/(tabs)');
      }
    }
  }, [isLoading, isAuthenticated, hasCompletedOnboarding]);

  // Show loading screen while checking authentication and onboarding status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If user is authenticated and onboarding is completed, show loading while navigating
  if (isAuthenticated && hasCompletedOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If user is not authenticated and onboarding is completed, show loading while navigating to auth
  if (!isAuthenticated && hasCompletedOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If user is not authenticated, show loading while navigating to sign-in
  if (!isAuthenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show onboarding screen (user is authenticated but onboarding not completed)
  return <OnboardingScreenComponent />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
