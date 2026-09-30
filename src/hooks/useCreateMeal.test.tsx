import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import { AxiosError, AxiosResponse } from 'axios';
import * as FileSystem from 'expo-file-system/legacy';

import { httpClient } from '../services/httpClient';
import { useCreateMeal } from './useCreateMeal';

jest.mock('../services/httpClient', () => ({ httpClient: { post: jest.fn() } }));
jest.mock('expo-file-system/legacy', () => ({
  getInfoAsync: jest.fn(),
  uploadAsync: jest.fn(),
  FileSystemUploadType: { BINARY_CONTENT: 0 },
}));

const post = httpClient.post as jest.Mock;
const getInfoAsync = FileSystem.getInfoAsync as jest.Mock;
const uploadAsync = FileSystem.uploadAsync as jest.Mock;

function createWrapper(queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useCreateMeal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    post.mockResolvedValue({ data: { uploadURL: 'https://upload.example/file', mealId: 'meal-1' } });
    getInfoAsync.mockResolvedValue({ exists: true, size: 123456 });
    uploadAsync.mockResolvedValue({ status: 200 });
  });

  it('declares the exact file size so the server can enforce its size cap', async () => {
    // Arrange
    const { result } = await renderHook(() => useCreateMeal({ fileType: 'image/jpeg', onSuccess: jest.fn() }), {
      wrapper: createWrapper(),
    });

    // Act
    await act(async () => {
      await result.current.createMeal('file:///photo.jpg');
    });

    // Assert
    expect(getInfoAsync).toHaveBeenCalledWith('file:///photo.jpg');
    expect(post).toHaveBeenCalledWith('/meals', { fileType: 'image/jpeg', fileSize: 123456 });
  });

  it('uploads the file to the returned URL and reports the new meal', async () => {
    // Arrange
    const onSuccess = jest.fn();
    const { result } = await renderHook(() => useCreateMeal({ fileType: 'audio/m4a', onSuccess }), {
      wrapper: createWrapper(),
    });

    // Act
    await act(async () => {
      await result.current.createMeal('file:///voice.m4a');
    });

    // Assert
    expect(uploadAsync).toHaveBeenCalledWith(
      'https://upload.example/file',
      'file:///voice.m4a',
      expect.objectContaining({ httpMethod: 'PUT' }),
    );
    expect(onSuccess).toHaveBeenCalledWith('meal-1');
  });

  it.each([403, 400, 500])('treats an upload rejected by storage (HTTP %s) as a failure, not a success', async (status) => {
    // Arrange: uploadAsync resolves with the response instead of throwing on non-2xx statuses.
    uploadAsync.mockResolvedValue({ status, body: '<Error>SignatureDoesNotMatch</Error>' });
    const onSuccess = jest.fn();
    const { result } = await renderHook(() => useCreateMeal({ fileType: 'audio/m4a', onSuccess }), {
      wrapper: createWrapper(),
    });

    // Act
    await act(async () => {
      await expect(result.current.createMeal('file:///voice.m4a')).rejects.toThrow();
    });

    // Assert
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('asks for the consent again when the server says it is required', async () => {
    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    post.mockRejectedValue(
      new AxiosError('Forbidden', '403', undefined, undefined, {
        status: 403,
        data: { error: 'consent_required', version: '1' },
      } as AxiosResponse),
    );
    const { result } = await renderHook(() => useCreateMeal({ fileType: 'image/jpeg', onSuccess: jest.fn() }), {
      wrapper: createWrapper(queryClient),
    });

    // Act
    await act(async () => {
      await expect(result.current.createMeal('file:///photo.jpg')).rejects.toThrow();
    });

    // Assert
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['consent'] });
  });

  it('leaves the consent alone when the failure is unrelated to it', async () => {
    // Arrange
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    post.mockRejectedValue(new Error('network down'));
    const { result } = await renderHook(() => useCreateMeal({ fileType: 'image/jpeg', onSuccess: jest.fn() }), {
      wrapper: createWrapper(queryClient),
    });

    // Act
    await act(async () => {
      await expect(result.current.createMeal('file:///photo.jpg')).rejects.toThrow();
    });

    // Assert
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: ['consent'] });
  });

  it('does not contact the server when the file cannot be read', async () => {
    // Arrange
    getInfoAsync.mockResolvedValue({ exists: false });
    const { result } = await renderHook(() => useCreateMeal({ fileType: 'image/jpeg', onSuccess: jest.fn() }), {
      wrapper: createWrapper(),
    });

    // Act
    await act(async () => {
      await expect(result.current.createMeal('file:///missing.jpg')).rejects.toThrow();
    });

    // Assert
    expect(post).not.toHaveBeenCalled();
    expect(uploadAsync).not.toHaveBeenCalled();
  });
});
