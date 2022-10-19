import { useMemo } from 'react';

import { useSardineSdkConfig } from './../components/sardine/useSardineSdkConfig';
import { useUser, useUserState } from './auth-token-context';
import { requireEnvVar } from './env';

interface MutationFetcherOptions {
  method?: 'POST' | 'DELETE';
  onFetchSuccess?: (data: any) => Promise<unknown>;
}

const API_URL = requireEnvVar('NEXT_PUBLIC_API_URL');

export const createMutationFetcher = <TRequestData, TQueryFnData>(
  path: string,
  options: MutationFetcherOptions,
  authToken?: string,
  sardineSessionKey?: string
) => {
  return async (body: TRequestData): Promise<TQueryFnData> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    if (sardineSessionKey) {
      headers['X-Sardine-Session'] = sardineSessionKey;
    }
    let promise = fetch(`${API_URL}${path}`, {
      method: options.method ?? 'POST',
      headers: headers,
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          throw new Error(res.error);
        }
        return res.result;
      });

    if (options.onFetchSuccess) {
      promise = promise.then(options.onFetchSuccess);
    }

    return promise;
  };
};

export function useMutationFetcher<TRequestData, TQueryFnData>(
  path: string,
  options?: MutationFetcherOptions
) {
  const userState = useUserState();

  const { data } = useSardineSdkConfig();

  return useMemo(
    () =>
      createMutationFetcher<TRequestData, TQueryFnData>(
        path,
        options ?? { method: 'POST' },
        userState?.user?.token,
        data?.context.sessionKey
      ),
    [options, path, userState?.user?.token, data?.context.sessionKey]
  );
}
