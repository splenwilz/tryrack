# React Query Quick Reference

## Installation

```bash
npm install @tanstack/react-query @tanstack/react-query-persist-client @tanstack/query-async-storage-persister @react-native-community/netinfo
```

## Basic Usage

### 1. Fetch Data with useQuery

```tsx
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => apiClient.get('/users'),
  });

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error.message}</Text>;

  return <UserList users={data} />;
}
```

### 2. Mutate Data with useMutation

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function AddItem() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (item) => apiClient.post('/items', item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  return (
    <Button onPress={() => mutation.mutate(newItem)}>
      Add Item
    </Button>
  );
}
```

### 3. Using Custom Hooks

```tsx
import { useUser, useSignin } from '@/hooks/useAuthQuery';

function LoginScreen() {
  const { data: user } = useUser();
  const signin = useSignin();

  const handleLogin = () => {
    signin.mutate({ email, password });
  };
}
```

## Common Patterns

### Refetch on Mount
```tsx
useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  refetchOnMount: true, // Default: true
});
```

### Disable Auto-fetching
```tsx
useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  enabled: false, // Manual fetch only
});
```

### Manual Refetch
```tsx
const { refetch } = useQuery({ queryKey: ['data'], queryFn: fetchData });
// Later...
refetch();
```

### Optimistic Updates
```tsx
useMutation({
  mutationFn: updateItem,
  onMutate: async (newItem) => {
    await queryClient.cancelQueries({ queryKey: ['items'] });
    const previous = queryClient.getQueryData(['items']);
    queryClient.setQueryData(['items'], (old) => [...old, newItem]);
    return { previous };
  },
  onError: (err, newItem, context) => {
    queryClient.setQueryData(['items'], context.previous);
  },
});
```

## Query Keys

Use the centralized query key factory:

```tsx
import { queryKeys } from '@/lib/query-client';

// Auth keys
queryKeys.auth.user()
queryKeys.auth.session()

// User keys
queryKeys.users.list({ status: 'active' })
queryKeys.users.detail(123)

// Wardrobe keys
queryKeys.wardrobe.items('outerwear')
queryKeys.wardrobe.item('item-123')
```

## API Client

```tsx
import { apiClient } from '@/lib/api';

// GET
const users = await apiClient.get('/users');

// POST
const newUser = await apiClient.post('/users', { name: 'John' });

// PUT
const updated = await apiClient.put(`/users/${id}`, userData);

// DELETE
await apiClient.delete(`/users/${id}`);
```

## Error Handling

```tsx
const { data, error, isError } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  retry: 3, // Retry 3 times on failure
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (isError) {
  console.error('Error:', error.message);
}
```

## Cache Management

```tsx
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate queries
queryClient.invalidateQueries({ queryKey: ['users'] });

// Refetch queries
queryClient.refetchQueries({ queryKey: ['users'] });

// Clear cache
queryClient.clear();
```

## Debugging

**Note:** React Query DevTools are web-only and not available for React Native.

### Console Logging
Debug queries using console logs:

```tsx
import { queryClient } from '@/lib/query-client';

// View cache
console.log('Query cache:', queryClient.getQueryCache().getAll());

// Log in useQuery
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  onSuccess: (data) => console.log('Fetched users:', data),
  onError: (error) => console.error('Fetch error:', error),
});
```

### Useful Commands
- View all queries: `queryClient.getQueryCache().getAll()`
- Invalidate: `queryClient.invalidateQueries({ queryKey: ['users'] })`
- Refetch: `queryClient.refetchQueries({ queryKey: ['users'] })`

