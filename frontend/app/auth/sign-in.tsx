import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '@/contexts/AuthContext';
import { signInSchema, type SignInFormData } from '@/schemas/authSchemas';
import { FormInput, SocialButton, PrimaryButton } from '@/components/auth/FormComponents';

/**
 * Sign In Screen Component
 * Allows users to sign in with email and password
 * 
 * Features:
 * - Email and password input with validation
 * - Forgot password functionality
 * - Social login options
 * - Form validation using React Hook Form and Yup
 * - Error handling and loading states
 * 
 * @see https://react-hook-form.com/ - Form validation library
 * @see https://github.com/jquense/yup - Schema validation
 * @see https://reactnative.dev/docs/scrollview - Scrollable content
 */
export default function SignInScreen() {
  const { signIn, socialSignIn, resetPassword, isLoading } = useAuth();
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignInFormData>({
    resolver: yupResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Handle form submission for sign in
   * Validates credentials and signs in user
   * 
   * @param data - Form data containing email and password
   */
  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signIn(data.email, data.password);
      if (result.success) {
        // Navigate to main app on successful sign in
        router.replace('/(tabs)');
      } else {
        // Set form error
        setError('root', {
          type: 'manual',
          message: result.error || 'Sign in failed',
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred',
      });
    }
  };

  /**
   * Handle forgot password
   * Sends password reset email
   * 
   * @param data - Form data containing email
   */
  const onForgotPassword = async (data: SignInFormData) => {
    try {
      const result = await resetPassword(data.email);
      if (result.success) {
        // TODO: Show success message
        console.log('Password reset email sent');
        setIsForgotPassword(false);
      } else {
        setError('root', {
          type: 'manual',
          message: result.error || 'Failed to send reset email',
        });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred',
      });
    }
  };

  /**
   * Handle social login
   * Initiates OAuth flow with the selected provider
   * 
   * @param provider - Social provider ('google', 'facebook', 'apple')
   */
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      const result = await socialSignIn(provider);
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        setError('root', {
          type: 'manual',
          message: result.error || 'Social login failed',
        });
      }
    } catch (error) {
      console.error('Social login error:', error);
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred',
      });
    }
  };

  /**
   * Navigate to sign up screen
   */
  const handleSignUp = () => {
    router.push('/auth/sign-up');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>TryRack</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Welcome Back!</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Welcome! Let's dive in your account
          </Text>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  leftIcon="mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Password"
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  isPassword
                />
              )}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => setIsForgotPassword(true)}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Error Message */}
            {errors.root && (
              <Text style={styles.errorText}>{errors.root.message}</Text>
            )}

            {/* Sign In Button */}
            <PrimaryButton
              title="Sign in"
              onPress={handleSubmit(isForgotPassword ? onForgotPassword : onSubmit)}
              disabled={isLoading}
              loading={isLoading}
            />

            {/* Separator */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>or</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtonsContainer}>
              <SocialButton
                provider="google"
                onPress={() => handleSocialLogin('google')}
                disabled={isLoading}
              />
              
              <SocialButton
                provider="apple"
                onPress={() => handleSocialLogin('apple')}
                disabled={isLoading}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account?{' '}
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.footerLink}>Sign Up</Text>
                </TouchableOpacity>
              </Text>
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
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
    marginBottom: 32,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  separatorText: {
    fontSize: 14,
    color: '#666666',
    marginHorizontal: 16,
  },
  socialButtonsContainer: {
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  footerLink: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
});
