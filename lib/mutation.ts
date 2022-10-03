import { useMemo } from 'react';

import { useUser, useUserState } from './auth-token-context';

interface MutationFetcherOptions {
  method?: 'POST' | 'DELETE';
  onFetchSuccess?: (data: any) => Promise<unknown>;
}

export const createMutationFetcher = <TRequestData, TQueryFnData>(
  path: string,
  options: MutationFetcherOptions,
  authToken?: string
) => {
  return async (body: TRequestData): Promise<TQueryFnData> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    let promise = fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
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

  return useMemo(
    () =>
      createMutationFetcher<TRequestData, TQueryFnData>(
        path,
        options ?? { method: 'POST' },
        userState?.user?.token
      ),
    [options, path, userState?.user?.token]
  );
}
