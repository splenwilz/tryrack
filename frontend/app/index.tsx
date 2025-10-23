import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import OnboardingScreenComponent from './onboarding';
import { router } from 'expo-router';

/**
 * Root Index Component
 * Handles initial app navigation based on onboarding status
 * 
 * Features:
 * - Shows loading screen while checking onboarding status
 * - Redirects to onboarding if not completed
 * - Redirects to main app if onboarding is completed
 * - Handles navigation state management
 */
export default function Index() {
  const { isLoading, hasCompletedOnboarding } = useOnboarding();

  // Handle navigation when onboarding status changes
  useEffect(() => {
    if (!isLoading && hasCompletedOnboarding) {
      router.replace('/(tabs)');
    }
  }, [isLoading, hasCompletedOnboarding]);

  // Show loading screen while checking onboarding status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // If onboarding is completed, show loading while navigating
  if (hasCompletedOnboarding) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show onboarding screen
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
