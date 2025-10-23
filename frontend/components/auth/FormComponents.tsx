import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Form Input Component Props
 * Extends TextInput props with additional styling and validation
 */
interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

/**
 * Reusable Form Input Component
 * Provides consistent styling and validation display for form inputs
 * 
 * Features:
 * - Label and error message display
 * - Password visibility toggle
 * - Left and right icon support
 * - Consistent styling across forms
 * 
 * @param props - FormInputProps including TextInput props
 * @returns JSX element for form input
 */
export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  isPassword = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  ...textInputProps
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handlePasswordToggle = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>
      
      {/* Input Container */}
      <View style={[styles.inputContainer, error && styles.inputContainerError]}>
        {/* Left Icon */}
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color="#666666"
            style={styles.leftIcon}
          />
        )}
        
        {/* Text Input */}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeftIcon]}
          secureTextEntry={isPassword && !isPasswordVisible}
          placeholderTextColor="#999999"
          {...textInputProps}
        />
        
        {/* Right Icon */}
        {isPassword ? (
          <TouchableOpacity
            onPress={handlePasswordToggle}
            style={styles.rightIconContainer}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color="#666666"
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color="#666666"
            />
          </TouchableOpacity>
        ) : null}
      </View>
      
      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

/**
 * Social Login Button Component Props
 */
interface SocialButtonProps {
  provider: 'google' | 'facebook' | 'apple';
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Social Login Button Component
 * Provides consistent styling for social authentication buttons
 * 
 * @param provider - Social provider ('google', 'facebook', 'apple')
 * @param onPress - Press handler function
 * @param disabled - Whether button is disabled
 * @returns JSX element for social login button
 */
export const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  disabled = false,
}) => {
  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          icon: 'logo-google' as keyof typeof Ionicons.glyphMap,
          text: 'Sign in with Google',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          borderColor: '#E5E5E5',
        };
      case 'facebook':
        return {
          icon: 'logo-facebook' as keyof typeof Ionicons.glyphMap,
          text: 'Sign in with Facebook',
          backgroundColor: '#1877F2',
          textColor: '#ffffff',
          borderColor: '#1877F2',
        };
      case 'apple':
        return {
          icon: 'logo-apple' as keyof typeof Ionicons.glyphMap,
          text: 'Sign in with Apple',
          backgroundColor: '#000000',
          textColor: '#ffffff',
          borderColor: '#000000',
        };
      default:
        return {
          icon: 'logo-google' as keyof typeof Ionicons.glyphMap,
          text: 'Sign in',
          backgroundColor: '#ffffff',
          textColor: '#000000',
          borderColor: '#E5E5E5',
        };
    }
  };

  const config = getProviderConfig();

  return (
    <TouchableOpacity
      style={[
        styles.socialButton,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Ionicons
        name={config.icon}
        size={20}
        color={config.textColor}
        style={styles.socialIcon}
      />
      <Text style={[styles.socialButtonText, { color: config.textColor }]}>
        {config.text}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * Primary Action Button Component Props
 */
interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

/**
 * Primary Action Button Component
 * Provides consistent styling for primary action buttons
 * 
 * @param title - Button text
 * @param onPress - Press handler function
 * @param disabled - Whether button is disabled
 * @param loading - Whether button is in loading state
 * @returns JSX element for primary button
 */
export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.primaryButton,
        (disabled || loading) && styles.primaryButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.primaryButtonText,
        (disabled || loading) && styles.primaryButtonTextDisabled,
      ]}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 16,
    minHeight: 50,
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 12,
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIconContainer: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 50,
  },
  socialIcon: {
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#D4AF37', // Golden color matching the design
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 50,
  },
  primaryButtonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonTextDisabled: {
    color: '#999999',
  },
});
