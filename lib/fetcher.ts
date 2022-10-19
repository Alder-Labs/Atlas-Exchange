import { useMemo } from 'react';

import { useSardineSdkConfig } from './../components/sardine/useSardineSdkConfig';
import { useUserState } from './auth-token-context';
import { requireEnvVar } from './env';

const API_URL = requireEnvVar('NEXT_PUBLIC_API_URL');
export const createFetcher = <TQueryFnData>(
  authToken?: string,
  sardineSessionKey?: string
) => {
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
    if (sardineSessionKey) {
      headers['X-Sardine-Session'] = sardineSessionKey;
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
  const { data } = useSardineSdkConfig();
  return useMemo(
    () =>
      createFetcher<TQueryFnData>(
        userState?.user?.token,
        data?.context.sessionKey
      ),
    [userState?.user?.token, data?.context.sessionKey]
  );
}
