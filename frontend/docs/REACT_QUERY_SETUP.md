# React Query Setup for TryRack

## Overview

This project uses **TanStack Query (React Query)** for data fetching and state management with a clean, scalable architecture.

## Architecture

```
frontend/
├── lib/
│   ├── api.ts              # API client with base configuration
│   └── query-client.ts      # Query client setup with React Native optimizations
├── hooks/
│   └── useAuthQuery.ts      # Custom React Query hooks for authentication
└── app/
    └── _layout.tsx          # QueryClientProvider integration
```

## Key Features

### 1. **Centralized API Client** (`lib/api.ts`)
- Automatic authentication token injection
- Error handling with custom `APIError` class
- Type-safe request methods (GET, POST, PUT, PATCH, DELETE)
- Consistent base URL configuration

### 2. **Query Client Configuration** (`lib/query-client.ts`)
- React Native-specific optimizations:
  - Network-aware caching
  - AsyncStorage persistence
  - Automatic refetch on reconnect
- Organized query keys factory
- Cache persistence for 24 hours

### 3. **Custom Hooks** (`hooks/useAuthQuery.ts`)
- `useUser()` - Fetch current user
- `useSignup()` - User registration
- `useSignin()` - User login
- `useVerifyEmail()` - Email verification
- `useCompleteProfile()` - Profile completion
- `useUpdateUserType()` - Update user type

## Usage Examples

### Fetching Data

```tsx
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.wardrobe.items('outerwear'),
    queryFn: async () => apiClient.get('/wardrobe/items?category=outerwear'),
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <WardrobeList items={data} />;
}
```

### Mutating Data

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';

function AddItemForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (item: WardrobeItem) => apiClient.post('/wardrobe/items', item),
    onSuccess: () => {
      // Invalidate and refetch wardrobe queries
      queryClient.invalidateQueries({ queryKey: queryKeys.wardrobe.all });
    },
  });

  return (
    <form onSubmit={() => mutation.mutate(newItem)}>
      {/* form fields */}
    </form>
  );
}
```

### Using Custom Hooks

```tsx
import { useUser } from '@/hooks/useAuthQuery';

function ProfileScreen() {
  const { data: user, isLoading } = useUser();

  if (isLoading) return <Loading />;

  return <Text>Welcome, {user?.username}!</Text>;
}
```

## Query Keys Organization

Query keys are organized by domain for consistency and easy invalidation:

```tsx
queryKeys = {
  auth: { all, user, session },
  users: { all, detail(id), list(filters) },
  wardrobe: { all, items(category), item(id) },
  boutique: { all, items(category), item(id), orders, analytics },
  catalog: { all, products(status), product(id) },
  profile: { all, details, insights, outfits },
};
```

## React Native Optimizations

### Network State Management
- Uses `NetInfo` to detect connectivity
- Refetches stale data when network reconnects
- Queues mutations when offline

### Persistence
- Query cache persists to AsyncStorage
- 24-hour cache time (configurable)
- Automatic cache hydration on app start

### Performance
- Automatic deduplication of identical queries
- Background refetching for fresh data
- Optimistic updates for mutations

## Benefits Over Fetch

1. **Automatic Caching**: No manual cache management
2. **Background Refetching**: Keeps data fresh automatically
3. **Optimistic Updates**: Better UX for mutations
4. **DevTools**: Built-in debugging tools
5. **Error Handling**: Centralized error retry logic
6. **Loading States**: Built-in loading and error states
7. **Type Safety**: Full TypeScript support

## Migration Guide

### Before (Using Fetch)

```tsx
const [data, setData] = useState();
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetch('/api/users')
    .then(res => res.json())
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

### After (Using React Query)

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => apiClient.get('/users'),
});
```

## Debugging

**Note:** React Query DevTools are web-only and not available for React Native.

### Console Logging
Monitor queries in development by enabling debug mode in QueryClient:

```tsx
// In lib/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Enable detailed logging in development
      ...(__DEV__ && {
        onSuccess: (data) => console.log('Query success:', data),
        onError: (error) => console.error('Query error:', error),
      }),
    },
  },
});
```

### Useful Debug Commands

```tsx
import { queryClient } from '@/lib/query-client';

// View all queries
console.log('All queries:', queryClient.getQueryCache().getAll());

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['users'] });

// Refetch
queryClient.refetchQueries({ queryKey: ['users'] });
```

## Next Steps

1. Create more custom hooks for wardrobe, boutique, and catalog operations
2. Implement optimistic updates for better UX
3. Add query invalidation strategies
4. Configure advanced caching strategies

