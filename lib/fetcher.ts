import { useMemo } from 'react';

import { useUserState } from './auth-token-context';
import { requireEnvVar } from './env';

const API_URL = requireEnvVar('NEXT_PUBLIC_API_URL');
export const createFetcher = <TQueryFnData>(authToken?: string) => {
  return async ({
    queryKey,
  }: {
    queryKey: [string];
  }): Promise<TQueryFnData | never> => {
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
  };
};

export function useFetcher<TQueryFnData>() {
  const userState = useUserState();
  return useMemo(
    () => createFetcher<TQueryFnData>(userState?.user?.token),
    [userState?.user?.token]
  );
}
