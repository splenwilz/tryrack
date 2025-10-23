import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { SocialButton, PrimaryButton } from '@/components/auth/FormComponents';

/**
 * Get Started Screen Component
 * First screen in the authentication flow, offering social login options
 * 
 * Features:
 * - Social login buttons (Google, Facebook, Apple)
 * - Email sign in option
 * - Sign up navigation
 * - Clean, modern design matching the provided mockup
 * 
 * @see https://react-hook-form.com/ - Form validation used in subsequent screens
 * @see https://reactnative.dev/docs/safeareaview - Safe area handling
 */
export default function GetStartedScreen() {
  const { socialSignIn, isLoading } = useAuth();

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
        // Navigate to main app on successful login
        router.replace('/(tabs)');
      } else {
        // TODO: Show error message to user
        console.error('Social login failed:', result.error);
      }
    } catch (error) {
      console.error('Social login error:', error);
    }
  };

  /**
   * Navigate to sign in screen
   */
  const handleSignInWithEmail = () => {
    router.push('/auth/sign-in');
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
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>TryRack</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Get Started</Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Welcome! Let's dive in your account
        </Text>

        {/* Social Login Buttons */}
        <View style={styles.socialButtonsContainer}>
          <SocialButton
            provider="google"
            onPress={() => handleSocialLogin('google')}
            disabled={isLoading}
          />
          
          <SocialButton
            provider="facebook"
            onPress={() => handleSocialLogin('facebook')}
            disabled={isLoading}
          />
          
          <SocialButton
            provider="apple"
            onPress={() => handleSocialLogin('apple')}
            disabled={isLoading}
          />
        </View>

        {/* Email Sign In Button */}
        <PrimaryButton
          title="Sign in with email"
          onPress={handleSignInWithEmail}
          disabled={isLoading}
        />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  socialButtonsContainer: {
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
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
