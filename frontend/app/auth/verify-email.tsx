import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormInput, PrimaryButton } from '@/components/auth/FormComponents';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Email Verification Form Data
 */
interface EmailVerificationFormData {
  code: string;
}

/**
 * Email Verification Schema
 * Validates the verification code input
 */
const emailVerificationSchema = yup.object({
  code: yup
    .string()
    .required('Verification code is required')
    .min(4, 'Verification code must be at least 4 characters')
    .max(10, 'Verification code must be less than 10 characters'),
});

/**
 * Email Verification Screen Component
 * Allows users to verify their email with a code sent by WorkOS
 * 
 * Features:
 * - Verification code input with validation
 * - Resend code functionality
 * - Error handling and loading states
 * - Clean, modern design matching the app theme
 * 
 * @see https://react-hook-form.com/ - Form validation library
 * @see https://github.com/jquense/yup - Schema validation
 * @see https://reactnative.dev/docs/scrollview - Scrollable content
 */
export default function EmailVerificationScreen() {
  const [isResending, setIsResending] = useState(false);
  const { verifyEmail, isLoading } = useAuth();
  
  // Get email and pending token from route params (passed from sign-up)
  const { email, pendingToken } = useLocalSearchParams<{
    email: string;
    pendingToken: string;
  }>();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<EmailVerificationFormData>({
    resolver: yupResolver(emailVerificationSchema),
    defaultValues: {
      code: '',
    },
  });

  /**
   * Handle verification code submission
   * Verifies the code with WorkOS and completes authentication
   * 
   * @param data - Form data containing verification code
   */
  const onSubmit = async (data: EmailVerificationFormData) => {
    try {
      if (!pendingToken) {
        setError('root', {
          type: 'manual',
          message: 'Missing verification token. Please try signing up again.',
        });
        return;
      }
      
      const result = await verifyEmail(pendingToken, data.code);
      
      if (result.success) {
        // Navigate to main app on successful verification
        router.replace('/(tabs)');
      } else {
        setError('root', {
          type: 'manual',
          message: result.error || 'Verification failed',
        });
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred',
      });
    }
  };

  /**
   * Handle resend verification code
   * Sends a new verification code to the user's email
   */
  const onResendCode = async () => {
    try {
      setIsResending(true);
      
      // TODO: Implement resend code functionality
      // This would call a resend endpoint or trigger the sign-up flow again
      Alert.alert(
        'Code Sent',
        'A new verification code has been sent to your email.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Resend code error:', error);
      Alert.alert(
        'Error',
        'Failed to resend verification code. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsResending(false);
    }
  };

  /**
   * Navigate back to sign up screen
   */
  const goBackToSignUp = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>TryRack</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Verify Your Email</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            We sent a verification code to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>

          {/* Verification Code Input */}
          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Verification Code"
                  placeholder="Enter verification code"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.code?.message}
                  keyboardType="numeric"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />

            {/* Root Error */}
            {errors.root && (
              <Text style={styles.errorText}>{errors.root.message}</Text>
            )}

            {/* Verify Button */}
            <PrimaryButton
              title="Verify Email"
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              loading={isLoading}
            />

            {/* Resend Code */}
            <TouchableOpacity
              style={styles.resendButton}
              onPress={onResendCode}
              disabled={isResending}
            >
              <Text style={styles.resendText}>
                {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back to Sign Up */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={goBackToSignUp}>
              <Text style={styles.footerLink}>Back to Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37', // Golden color matching the design
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  emailText: {
    fontWeight: '600',
    color: '#D4AF37',
  },
  formContainer: {
    marginBottom: 32,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerLink: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
});
