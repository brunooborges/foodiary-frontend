import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { CONSENT_TEXT_VERSION } from '../constants/consent';
import { httpClient } from '../services/httpClient';

type Consent = {
  version: string;
  accepted: boolean;
  acceptedAt: string | null;
};

const CONSENT_QUERY_KEY = ['consent'];

export function useConsent() {
  const queryClient = useQueryClient();

  const { data: consent, isLoading } = useQuery({
    queryKey: CONSENT_QUERY_KEY,
    queryFn: async () => {
      const { data } = await httpClient.get<{ consent: Consent }>('/consent');

      return data.consent;
    },
  });

  function refreshConsent() {
    return queryClient.invalidateQueries({ queryKey: CONSENT_QUERY_KEY });
  }

  const { mutateAsync: accept, isPending: isAccepting } = useMutation({
    mutationFn: async () => {
      await httpClient.post('/consent', { version: CONSENT_TEXT_VERSION });
    },
    onSuccess: refreshConsent,
  });

  const { mutateAsync: withdraw, isPending: isWithdrawing } = useMutation({
    mutationFn: async () => {
      await httpClient.delete('/consent');
    },
    onSuccess: refreshConsent,
  });

  return {
    isAccepted: consent?.accepted ?? false,
    isLoading,
    isSaving: isAccepting || isWithdrawing,
    accept,
    withdraw,
  };
}
