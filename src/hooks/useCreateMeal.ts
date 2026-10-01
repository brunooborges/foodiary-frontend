import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import * as FileSystem from 'expo-file-system/legacy';

import { httpClient } from '../services/httpClient';

type CreateMealResponse = {
  uploadURL: string;
  mealId: string;
};

type CreateMealParams = {
  fileType: 'image/jpeg' | 'audio/m4a';
  onSuccess(mealId: string): void;
};

export function useCreateMeal({ fileType, onSuccess }: CreateMealParams) {
  const queryClient = useQueryClient();
  const { mutateAsync: createMeal, isPending } = useMutation({
    mutationFn: async (uri: string) => {
      const file = await FileSystem.getInfoAsync(uri);

      if (!file.exists) {
        throw new Error('The file to upload does not exist.');
      }

      // The server validates this size against its cap and signs the upload URL for exactly this many bytes.
      const { data } = await httpClient.post<CreateMealResponse>('/meals', {
        fileType: fileType,
        fileSize: file.size,
      });

      const upload = await FileSystem.uploadAsync(data.uploadURL, uri, {
        httpMethod: 'PUT',
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      });

      // uploadAsync resolves with the response instead of throwing, so a rejection by storage must be detected here.
      if (upload.status < 200 || upload.status >= 300) {
        throw new Error(`The upload was rejected by storage (HTTP ${upload.status}).`);
      }

      return { mealId: data.mealId };
    },
    onError: (error) => {
      // The consent on this device is out of date (withdrawn elsewhere or text updated): ask again on the next tap.
      if (isAxiosError(error) && error.response?.status === 403 && error.response.data?.error === 'consent_required') {
        queryClient.invalidateQueries({ queryKey: ['consent'] });
      }
    },
    onSuccess: ({ mealId }) => {
      onSuccess(mealId);
      queryClient.refetchQueries({ queryKey: ['meals'] });
    },
  });

  return {
    createMeal,
    isLoading: isPending,
  };
}
