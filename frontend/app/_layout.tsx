import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/contexts/AuthContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { UserTypeProvider } from '@/contexts/UserTypeContext';
import { PersistQueryClientProvider, asyncStoragePersister, queryClient } from '@/lib/query-client';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ 
        persister: asyncStoragePersister,
        // Optional: max age for persisted data (24 hours)
        maxAge: 24 * 60 * 60 * 1000,
        // Buster: Increment this to invalidate all persisted cache (useful for migrations)
        // Changed from undefined to 1 to invalidate old cache with pending queries
        buster: 'v1',
        // Only persist queries that have successfully completed
        // This prevents "dehydrated as pending" errors when rehydrating
        // Reference: https://tanstack.com/query/latest/docs/framework/react/reference/hydration#shoulddehydratequery
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist queries with successful status
            // Filter out pending/loading queries to prevent CancelledError on rehydration
            return query.state.status === 'success';
          },
        },
      }}
    >
      <AuthProvider>
        <WishlistProvider>
          <UserTypeProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="profile-completion" options={{ headerShown: false }} />
                <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
                <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(boutique-tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="(boutique)" options={{ headerShown: false }} />
                <Stack.Screen name="category" options={{ headerShown: false }} />
                <Stack.Screen name="shop-category" options={{ headerShown: false }} />
                <Stack.Screen name="virtual-tryon" options={{ headerShown: false }} />
                <Stack.Screen name="style-insights" options={{ headerShown: false }} />
                <Stack.Screen name="outfit-history" options={{ headerShown: false }} />
                <Stack.Screen name="terms-of-service" options={{ headerShown: false }} />
                <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
                <Stack.Screen name="licenses" options={{ headerShown: false }} />
                <Stack.Screen name="add-item" options={{ headerShown: false }} />
                <Stack.Screen name="wardrobe-item-detail" options={{ headerShown: false }} />
                <Stack.Screen name="todays-outfit" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </UserTypeProvider>
        </WishlistProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}