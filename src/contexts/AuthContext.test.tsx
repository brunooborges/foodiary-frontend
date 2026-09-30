import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useContext } from 'react';

import { httpClient } from '../services/httpClient';
import { AuthContext, AuthProvider } from './AuthContext';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('../services/httpClient', () => ({
  httpClient: { get: jest.fn(), post: jest.fn(), defaults: { headers: { common: {} } } },
}));

const get = httpClient.get as jest.Mock;

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    get.mockResolvedValue({ data: { user: { id: 'user-a', name: 'A', email: 'a@b.c' } } });
  });

  it('forgets everything cached for the previous account when signing out, including the consent', async () => {
    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
    const { result } = await renderHook(() => useContext(AuthContext), { wrapper });

    queryClient.setQueryData(['consent'], { version: '1', accepted: true, acceptedAt: '2025-01-01T00:00:00.000Z' });
    queryClient.setQueryData(['meals', '2025-01-15'], [{ id: 'meal-of-user-a' }]);

    // Act
    await act(async () => {
      await result.current.signOut();
    });

    // Assert
    await waitFor(() => expect(result.current.user).toBeNull());
    expect(queryClient.getQueryData(['consent'])).toBeUndefined();
    expect(queryClient.getQueryData(['meals', '2025-01-15'])).toBeUndefined();
  });
});
