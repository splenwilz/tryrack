import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { API_CONFIG, WORKOS_CONFIG, OAUTH_CONFIG, getApiUrl, getWorkOSAuthUrl } from '@/constants/config';

// Re-export OAuthResponse type for consistency with Google OAuth
export interface OAuthUser {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  is_active: boolean;
}

export interface OAuthResponse {
  access_token: string;
  token_type: string;
  user: OAuthUser;
}

export function useAppleOAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use custom scheme directly for OAuth
  // Based on Expo AuthSession documentation
  const finalRedirectUri = `${OAUTH_CONFIG.REDIRECT_SCHEME}://${OAUTH_CONFIG.REDIRECT_PATH}`;
  
  console.log('🔍 Apple OAuth Debug - Using redirect URI:', finalRedirectUri);

  const signInWithApple = async (): Promise<OAuthResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Generate WorkOS authorization URL for Apple OAuth
      // Based on WorkOS React Native/Expo documentation
      // We need to use the frontend redirect URI, not the backend one
      const state = Date.now().toString();
      const authorizationUrl = getWorkOSAuthUrl(WORKOS_CONFIG.PROVIDERS.APPLE, finalRedirectUri, state);
      
      console.log('🔍 Apple OAuth Debug - Generated authorization URL:', authorizationUrl);

      // Step 2: Open OAuth URL in browser
      // Based on Expo WebBrowser documentation
      const result = await WebBrowser.openAuthSessionAsync(
        authorizationUrl,
        finalRedirectUri,
        {
          showInRecents: true,
          preferEphemeralSession: true, // Better security for OAuth
        }
      );

      console.log('🔍 Apple OAuth Debug - WebBrowser result:', result);

      // Step 3: Handle the result
      if (result.type === 'success' && result.url) {
        // Extract authorization code from the callback URL
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        console.log('🔍 Apple OAuth Debug - Callback URL:', result.url);
        console.log('🔍 Apple OAuth Debug - Authorization code:', code);
        console.log('🔍 Apple OAuth Debug - Error:', error);

        if (error) {
          throw new Error(`Apple OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Apple');
        }

        // Step 4: Exchange code for access token via our backend
        // Based on our OAuth callback endpoint implementation
        const callbackUrl = getApiUrl(API_CONFIG.OAUTH_CALLBACK);
        const tokenResponse = await fetch(`${callbackUrl}?code=${code}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('❌ Apple Token exchange error:', tokenResponse.status, errorText);
          throw new Error(`Failed to exchange Apple code for token: ${tokenResponse.status}`);
        }

        const data: OAuthResponse = await tokenResponse.json();
        console.log('🔍 Apple OAuth Debug - Token response:', data);
        return data;

      } else if (result.type === 'cancel') {
        // User cancelled the OAuth flow
        console.log('🔍 Apple OAuth Debug - User cancelled OAuth flow');
        return null;
      } else {
        throw new Error('Apple OAuth authentication failed');
      }

    } catch (err) {
      console.error('❌ Apple OAuth Error:', err);
      setError(err instanceof Error ? err.message : 'Apple authentication failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithApple,
    isLoading,
    error,
  };
}
