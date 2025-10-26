import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserType } from '@/contexts/UserTypeContext';
import { router } from 'expo-router';

/**
 * Root Index Component
 * Handles initial app navigation based on authentication, onboarding, and user type
 * 
 * Features:
 * - Shows loading screen while checking authentication and user type status
 * - Redirects to sign-in if not authenticated
 * - Redirects to onboarding if authenticated but onboarding not completed
 * - Redirects to appropriate app layout based on user type (individual vs boutique)
 * - Handles navigation state management
 */
export default function Index() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const { isLoading: userTypeLoading, isOnboardingComplete, userType } = useUserType();

  const isLoading = authLoading || userTypeLoading;

  // Handle navigation based on authentication, onboarding, and user type
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // User not authenticated, go to sign-in
        router.replace('/auth/sign-in');
      } else if (!isOnboardingComplete) {
        // User authenticated but onboarding not completed, go to onboarding
        router.replace('/onboarding');
      } else if (userType === 'individual') {
        // Individual user, go to individual tabs
        router.replace('/(tabs)');
      } else if (userType === 'boutique') {
        // Boutique user, go to boutique tabs - dashboard is initial route
        router.replace('/(boutique-tabs)/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, isOnboardingComplete, userType]);

  // Show loading screen while checking status
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // This component doesn't render anything as it only handles navigation
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});