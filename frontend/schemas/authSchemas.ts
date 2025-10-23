import * as yup from 'yup';

/**
 * Form Validation Schemas
 * Defines validation rules for authentication forms using Yup
 * 
 * @see https://github.com/jquense/yup - Schema validation library
 * @see https://react-hook-form.com/get-started#SchemaValidation - React Hook Form integration
 */

/**
 * Email validation schema
 * Validates email format and requirements
 */
export const emailSchema = yup.string()
  .email('Please enter a valid email address')
  .required('Email is required');

/**
 * Password validation schema
 * Validates password strength and requirements
 */
export const passwordSchema = yup.string()
  .min(8, 'Password must be at least 8 characters')
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  )
  .required('Password is required');

/**
 * Sign In Form Schema
 * Validates email and password for sign in
 */
export const signInSchema = yup.object({
  email: emailSchema,
  password: yup.string().required('Password is required'),
});

/**
 * Sign Up Form Schema
 * Validates email, password, and password confirmation for sign up
 */
export const signUpSchema = yup.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Password confirmation is required'),
});

/**
 * Forgot Password Schema
 * Validates email for password reset
 */
export const forgotPasswordSchema = yup.object({
  email: emailSchema,
});

/**
 * Type definitions for form data
 * Provides TypeScript types for form validation
 */
export type SignInFormData = yup.InferType<typeof signInSchema>;
export type SignUpFormData = yup.InferType<typeof signUpSchema>;
export type ForgotPasswordFormData = yup.InferType<typeof forgotPasswordSchema>;
