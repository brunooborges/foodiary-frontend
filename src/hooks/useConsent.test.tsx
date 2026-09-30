import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { CONSENT_TEXT_VERSION } from '../constants/consent';
import { httpClient } from '../services/httpClient';
import { useConsent } from './useConsent';

jest.mock('../services/httpClient', () => ({ httpClient: { get: jest.fn(), post: jest.fn(), delete: jest.fn() } }));

const get = httpClient.get as jest.Mock;
const post = httpClient.post as jest.Mock;
const remove = httpClient.delete as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const notAccepted = { consent: { version: CONSENT_TEXT_VERSION, accepted: false, acceptedAt: null } };
const accepted = { consent: { version: CONSENT_TEXT_VERSION, accepted: true, acceptedAt: '2025-02-01T10:00:00.000Z' } };

describe('useConsent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads whether the user has consented', async () => {
    // Arrange
    get.mockResolvedValue({ data: accepted });

    // Act
    const { result } = await renderHook(() => useConsent(), { wrapper: createWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isAccepted).toBe(true));
    expect(get).toHaveBeenCalledWith('/consent');
  });

  it('treats the user as not consented until the server says otherwise', async () => {
    // Arrange
    get.mockResolvedValue({ data: notAccepted });

    // Act
    const { result } = await renderHook(() => useConsent(), { wrapper: createWrapper() });

    // Assert
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAccepted).toBe(false);
  });

  it('accepts the version of the text the app displays and refreshes the status', async () => {
    // Arrange
    get.mockResolvedValueOnce({ data: notAccepted }).mockResolvedValue({ data: accepted });
    post.mockResolvedValue({ data: accepted });
    const { result } = await renderHook(() => useConsent(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Act
    await act(async () => {
      await result.current.accept();
    });

    // Assert
    expect(post).toHaveBeenCalledWith('/consent', { version: CONSENT_TEXT_VERSION });
    await waitFor(() => expect(result.current.isAccepted).toBe(true));
  });

  it('withdraws the consent and refreshes the status', async () => {
    // Arrange
    get.mockResolvedValueOnce({ data: accepted }).mockResolvedValue({ data: notAccepted });
    remove.mockResolvedValue({ data: notAccepted });
    const { result } = await renderHook(() => useConsent(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isAccepted).toBe(true));

    // Act
    await act(async () => {
      await result.current.withdraw();
    });

    // Assert
    expect(remove).toHaveBeenCalledWith('/consent');
    await waitFor(() => expect(result.current.isAccepted).toBe(false));
  });
});
