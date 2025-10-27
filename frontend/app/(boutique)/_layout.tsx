import { Stack } from 'expo-router';

/**
 * Boutique Layout
 * Defines the layout for boutique-related screens that are not part of the tab navigation.
 * These are typically detail screens, modals, or auxiliary views that should be accessible
 * from the boutique tab navigation but are not tabs themselves.
 */
export default function BoutiqueLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="product-detail" options={{ headerShown: false }} />
      <Stack.Screen name="product-edit" options={{ headerShown: false }} />
      <Stack.Screen name="boutique-tryon" options={{ headerShown: false }} />
      <Stack.Screen name="order-detail" options={{ headerShown: false }} />
      <Stack.Screen name="privacy-security" options={{ headerShown: false }} />
      <Stack.Screen name="help-support" options={{ headerShown: false }} />
      <Stack.Screen name="about" options={{ headerShown: false }} />
    </Stack>
  );
}
