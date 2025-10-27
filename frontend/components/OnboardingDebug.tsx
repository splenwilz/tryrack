/**
 * Onboarding Debug Component
 * Temporary component to fix onboarding completion status
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useOnboarding } from '@/hooks/use-onboarding';

export default function OnboardingDebug() {
  const { markOnboardingCompleted, resetOnboarding } = useOnboarding();

  const handleMarkCompleted = async () => {
    await markOnboardingCompleted();
    Alert.alert('Success', 'Onboarding marked as completed!');
  };

  const handleReset = async () => {
    await resetOnboarding();
    Alert.alert('Success', 'Onboarding reset!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding Debug</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleMarkCompleted}>
        <Text style={styles.buttonText}>Mark Onboarding Completed</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset Onboarding</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
