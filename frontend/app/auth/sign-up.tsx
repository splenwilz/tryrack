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
import { signUpSchema, type SignUpFormData } from '@/schemas/authSchemas';
import { FormInput, PrimaryButton, SocialButton } from '@/components/auth/FormComponents';

/**
 * Sign Up Screen Component
 * Allows users to create a new account with email/password or social providers
 * 
 * Features:
 * - Email, password, and password confirmation inputs
 * - Social sign-up options (Google, Apple)
 * - Form validation using React Hook Form and Yup
 * - Terms and conditions acceptance
 * - Error handling and loading states
 * - Navigation to sign in screen
 * 
 * @see https://react-hook-form.com/ - Form validation library
 * @see https://github.com/jquense/yup - Schema validation
 * @see https://reactnative.dev/docs/scrollview - Scrollable content
 */
export default function SignUpScreen() {
  const { signUp, socialSignIn, isLoading } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  /**
   * Handle form submission for sign up
   * Creates new user account and handles email verification if required
   * 
   * @param data - Form data containing email, password, and confirmation
   */
  const onSubmit = async (data: SignUpFormData) => {
    try {
      console.log('🔍 Sign Up Screen Debug - Starting sign up process');
      const result = await signUp(data.email, data.password, data.confirmPassword);
      console.log('🔍 Sign Up Screen Debug - Sign up result:', result);
      
      if (result.success) {
        if (result.requiresVerification && result.verificationData) {
          console.log('🔍 Sign Up Screen Debug - Verification required, navigating to verification screen');
          // Navigate to email verification screen with verification data
          router.push({
            pathname: '/auth/verify-email',
            params: {
              email: result.verificationData.email,
              pendingToken: result.verificationData.pending_authentication_token,
            }
          });
        } else {
          console.log('🔍 Sign Up Screen Debug - No verification required, navigating to main app');
          // Navigate to main app on successful sign up (no verification required)
          router.replace('/(tabs)');
        }
      } else {
        console.log('🔍 Sign Up Screen Debug - Sign up failed:', result.error);
        // Set form error
        setError('root', {
          type: 'manual',
          message: result.error || 'Sign up failed',
        });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred',
      });
    }
  };

  /**
   * Navigate to sign in screen
   */
  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  /**
   * Handle social sign up
   * Initiates OAuth flow with the selected provider for account creation
   * 
   * @param provider - Social provider ('google', 'apple')
   */
  const handleSocialSignUp = async (provider: 'google' | 'apple') => {
    try {
      const result = await socialSignIn(provider);
      if (result.success) {
        // Navigate to main app on successful sign up
        router.replace('/(tabs)');
      } else {
        setError('root', {
          type: 'manual',
          message: result.error || 'Social sign up failed',
        });
      }
    } catch (error) {
      console.error('Social sign up error:', error);
      setError('root', {
        type: 'manual',
        message: 'An unexpected error occurred',
      });
    }
  };

  /**
   * Handle terms and conditions press
   * TODO: Navigate to terms and conditions screen
   */
  const handleTermsPress = () => {
    console.log('Navigate to terms and conditions');
  };

  /**
   * Handle privacy policy press
   * TODO: Navigate to privacy policy screen
   */
  const handlePrivacyPress = () => {
    console.log('Navigate to privacy policy');
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
          <Text style={styles.title}>Create New Account</Text>
          
          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Create your account in seconds. Your privacy important to us
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

            {/* Confirm Password Input */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  label="Password"
                  placeholder="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                  isPassword
                />
              )}
            />

            {/* Error Message */}
            {errors.root && (
              <Text style={styles.errorText}>{errors.root.message}</Text>
            )}

            {/* Sign Up Button */}
            <PrimaryButton
              title="Sign up"
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              loading={isLoading}
            />

            {/* Separator */}
            <View style={styles.separator}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>or</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Social Sign Up Buttons */}
            <View style={styles.socialButtonsContainer}>
              <SocialButton
                provider="google"
                onPress={() => handleSocialSignUp('google')}
                disabled={isLoading}
              />
              
              <SocialButton
                provider="apple"
                onPress={() => handleSocialSignUp('apple')}
                disabled={isLoading}
              />
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By registering you agree to{' '}
                <TouchableOpacity onPress={handleTermsPress}>
                  <Text style={styles.termsLink}>Terms & Conditions</Text>
                </TouchableOpacity>
                {' '}and{' '}
                <TouchableOpacity onPress={handlePrivacyPress}>
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </TouchableOpacity>
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <TouchableOpacity onPress={handleSignIn}>
                  <Text style={styles.footerLink}>Sign In</Text>
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
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E7',
  },
  separatorText: {
    fontSize: 14,
    color: '#8E8E93',
    marginHorizontal: 16,
  },
  socialButtonsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  termsContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
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
