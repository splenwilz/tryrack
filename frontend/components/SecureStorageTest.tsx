/**
 * Secure Storage Test Component
 * A simple component to test the secure storage implementation
 * 
 * @see https://docs.expo.dev/versions/latest/sdk/securestore/ - Official Expo SecureStore documentation
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { testSecureStorage, testAuthPersistence } from '@/utils/testSecureStorage';

export default function SecureStorageTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string>('');

  const runTests = async () => {
    setIsLoading(true);
    setTestResults('Running tests...\n');

    try {
      // Test 1: Basic secure storage functionality
      const storageTest = await testSecureStorage();
      setTestResults(prev => prev + `Storage Test: ${storageTest.success ? '✅ PASSED' : '❌ FAILED'}\n`);
      
      if (!storageTest.success) {
        setTestResults(prev => prev + `Error: ${storageTest.error}\n`);
      }

      // Test 2: Authentication persistence
      const persistenceTest = await testAuthPersistence();
      setTestResults(prev => prev + `Persistence Test: ${persistenceTest.success ? '✅ PASSED' : '❌ FAILED'}\n`);
      
      if (!persistenceTest.success) {
        setTestResults(prev => prev + `Error: ${persistenceTest.message}\n`);
      }

      // Show summary
      const allPassed = storageTest.success && persistenceTest.success;
      Alert.alert(
        'Test Results',
        allPassed ? 'All tests passed! 🎉' : 'Some tests failed. Check the results below.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      setTestResults(prev => prev + `Test Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
      Alert.alert('Test Error', 'An error occurred while running tests.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Storage Test</Text>
      <Text style={styles.description}>
        This component tests the secure storage implementation for authentication persistence.
      </Text>
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={runTests}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Running Tests...' : 'Run Tests'}
        </Text>
      </TouchableOpacity>

      {testResults ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          <Text style={styles.resultsText}>{testResults}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultsText: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});
