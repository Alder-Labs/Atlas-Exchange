import { useMemo, useCallback } from 'react';

import { useQuery } from 'react-query';

import { useUserState } from '../../lib/auth-token-context';
import { requireEnvVar } from '../../lib/env';
import { SardineSdkConfig } from '../../lib/types/sardine';

const API_URL = requireEnvVar('NEXT_PUBLIC_API_URL');

const SARDINE_LOCAL_STORAGE_KEY = 'sardineSdkConfig';

export const useSardineSdkConfig = () => {
  const userState = useUserState();
  const isSignedIn = !!userState?.user?.token;
  const authToken = userState.user?.token;

  const existingSardineSdkConfig = useMemo(() => {
    const existingSardineSdkConfigString = localStorage.getItem(
      SARDINE_LOCAL_STORAGE_KEY
    );
    if (existingSardineSdkConfigString) {
      return JSON.parse(existingSardineSdkConfigString) as SardineSdkConfig;
    }
    return null;
  }, []);

  const getSardineSdkConfig = useCallback(
    async ({ queryKey }: { queryKey: [string] }): Promise<SardineSdkConfig> => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const fetchUrl = `${API_URL}${queryKey[0]}`;
      return fetch(fetchUrl, {
        method: 'GET',
        headers: headers,
      })
        .then((res) => res.json())
        .then((res) => {
          if (!res.success) {
            throw new Error(res.error);
          }
          return res.result;
        });
    },
    [authToken]
  );

  const { data, error, isLoading, refetch } = useQuery(
    `/api/sardine/sdk-config`,
    getSardineSdkConfig,
    {
      enabled: isSignedIn && existingSardineSdkConfig === null,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        localStorage.setItem(SARDINE_LOCAL_STORAGE_KEY, JSON.stringify(data));
      },
    }
  );

  return useMemo(() => {
    return {
      data: existingSardineSdkConfig ?? data,
      error,
      refetch,
      isLoading,
    };
  }, [existingSardineSdkConfig, data, error, refetch, isLoading]);
};
