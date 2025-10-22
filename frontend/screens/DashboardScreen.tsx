/**
 * Dashboard Screen Component
 * Shows user information and protected content
 * Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/protected-routes
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { WORKOS_CONFIG } from '../config/workos';

interface ProtectedData {
  message: string;
  user_id: string;
  email: string;
}

export default function DashboardScreen() {
  const { user, signOut, isLoading } = useAuth();
  const [protectedData, setProtectedData] = useState<ProtectedData | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  /**
   * Fetch protected data from the backend
   * Reference: https://workos.com/docs/authkit/react/python/3-handle-the-user-session/protected-routes
   */
  const fetchProtectedData = async () => {
    try {
      setLoadingData(true);
      
      const response = await fetch(`${WORKOS_CONFIG.BACKEND_URL}/auth/protected-api`, {
        method: 'GET',
        credentials: 'include', // Include cookies for session management
      });

      if (response.ok) {
        const data = await response.json();
        setProtectedData(data);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.detail || 'Failed to fetch protected data');
      }
    } catch (error) {
      console.error('Error fetching protected data:', error);
      Alert.alert('Error', 'Network error while fetching protected data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  useEffect(() => {
    if (user) {
      fetchProtectedData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>
              Welcome, {user.first_name} {user.last_name}!
            </Text>
            <Text style={styles.emailText}>Email: {user.email}</Text>
            <Text style={styles.idText}>User ID: {user.id}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Protected Data</Text>
          
          <TouchableOpacity
            style={[styles.button, loadingData && styles.buttonDisabled]}
            onPress={fetchProtectedData}
            disabled={loadingData}
          >
            {loadingData ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Fetch Protected Data</Text>
            )}
          </TouchableOpacity>

          {protectedData && (
            <View style={styles.dataContainer}>
              <Text style={styles.dataText}>{protectedData.message}</Text>
              <Text style={styles.dataText}>User ID: {protectedData.user_id}</Text>
              <Text style={styles.dataText}>Email: {protectedData.email}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.signOutButton, isLoading && styles.buttonDisabled]}
          onPress={handleSignOut}
          disabled={isLoading}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            This data is fetched from a protected API endpoint that requires authentication.
          </Text>
          <Text style={styles.infoText}>
            Backend: {WORKOS_CONFIG.BACKEND_URL}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: '#e8f4fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  idText: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dataContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  dataText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  signOutButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  signOutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
});
