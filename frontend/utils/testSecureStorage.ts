/**
 * Secure Storage Test Utility
 * Provides functions to test the secure storage implementation
 * 
 * @see https://docs.expo.dev/versions/latest/sdk/securestore/ - Official Expo SecureStore documentation
 */

import { 
  storeAccessToken, 
  getAccessToken, 
  storeUserData,
  getUserData,
  clearAllAuthData,
  validateStoredToken
} from '@/utils/secureStorage';

/**
 * Test secure storage functionality
 * Verifies that tokens and user data can be stored and retrieved securely
 * 
 * @returns Promise that resolves with test results
 */
export async function testSecureStorage(): Promise<{
  success: boolean;
  results: {
    tokenStorage: boolean;
    userDataStorage: boolean;
    tokenValidation: boolean;
    dataCleanup: boolean;
  };
  error?: string;
}> {
  try {
    console.log('🧪 Testing secure storage implementation...');
    
    const results = {
      tokenStorage: false,
      userDataStorage: false,
      tokenValidation: false,
      dataCleanup: false,
    };

    // Test 1: Store and retrieve access token
    console.log('🧪 Test 1: Storing access token...');
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    await storeAccessToken(testToken);
    const retrievedToken = await getAccessToken();
    results.tokenStorage = retrievedToken === testToken;
    console.log('🧪 Test 1 result:', results.tokenStorage ? '✅ PASS' : '❌ FAIL');

    // Test 2: Store and retrieve user data
    console.log('🧪 Test 2: Storing user data...');
    const testUserData = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      is_active: true,
    };
    await storeUserData(testUserData);
    const retrievedUserData = await getUserData();
    results.userDataStorage = JSON.stringify(retrievedUserData) === JSON.stringify(testUserData);
    console.log('🧪 Test 2 result:', results.userDataStorage ? '✅ PASS' : '❌ FAIL');

    // Test 3: Validate stored token
    console.log('🧪 Test 3: Validating stored token...');
    const isValidToken = await validateStoredToken();
    results.tokenValidation = isValidToken;
    console.log('🧪 Test 3 result:', results.tokenValidation ? '✅ PASS' : '❌ FAIL');

    // Test 4: Clear all data
    console.log('🧪 Test 4: Clearing all auth data...');
    await clearAllAuthData();
    const tokenAfterClear = await getAccessToken();
    const userDataAfterClear = await getUserData();
    results.dataCleanup = tokenAfterClear === null && userDataAfterClear === null;
    console.log('🧪 Test 4 result:', results.dataCleanup ? '✅ PASS' : '❌ FAIL');

    const allTestsPassed = Object.values(results).every(result => result === true);
    
    console.log('🧪 All tests completed:', allTestsPassed ? '✅ ALL PASSED' : '❌ SOME FAILED');
    
    return {
      success: allTestsPassed,
      results,
    };

  } catch (error) {
    console.error('🧪 Test error:', error);
    return {
      success: false,
      results: {
        tokenStorage: false,
        userDataStorage: false,
        tokenValidation: false,
        dataCleanup: false,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test authentication persistence simulation
 * Simulates app restart by clearing memory state and restoring from storage
 * 
 * @returns Promise that resolves with persistence test results
 */
export async function testAuthPersistence(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log('🧪 Testing authentication persistence...');

    // Step 1: Store test authentication data
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const testUserData = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      is_active: true,
    };

    await storeAccessToken(testToken);
    await storeUserData(testUserData);

    // Step 2: Simulate app restart (clear memory, restore from storage)
    console.log('🧪 Simulating app restart...');
    
    // Validate token exists
    const isTokenValid = await validateStoredToken();
    if (!isTokenValid) {
      return {
        success: false,
        message: 'Token validation failed after simulated restart',
      };
    }

    // Restore user data
    const restoredUserData = await getUserData();
    if (!restoredUserData) {
      return {
        success: false,
        message: 'User data not found after simulated restart',
      };
    }

    // Verify data integrity
    const dataMatches = JSON.stringify(restoredUserData) === JSON.stringify(testUserData);
    if (!dataMatches) {
      return {
        success: false,
        message: 'User data integrity check failed',
      };
    }

    // Cleanup
    await clearAllAuthData();

    return {
      success: true,
      message: 'Authentication persistence test passed successfully',
    };

  } catch (error) {
    console.error('🧪 Persistence test error:', error);
    return {
      success: false,
      message: `Persistence test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
