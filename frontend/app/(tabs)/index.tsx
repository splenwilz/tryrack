/**
 * Main Home Screen with Authentication
 * Shows LoginScreen for unauthenticated users, DashboardScreen for authenticated users
 * Reference: https://workos.com/docs/authkit/react/python
 */

import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import LoginScreen from '../../screens/LoginScreen';
import DashboardScreen from '../../screens/DashboardScreen';

export default function HomeScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show appropriate screen based on authentication status
  return isAuthenticated ? <DashboardScreen /> : <LoginScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
