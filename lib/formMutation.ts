import { useMemo } from 'react';

import { useUserState } from './auth-token-context';
import { requireEnvVar } from './env';
import { UserStateStatus } from './types/user-states';

const API_URL = requireEnvVar('NEXT_PUBLIC_API_URL');

export const createFormMutationFetcher = <
  TRequestData extends Record<string, string | File>,
  TQueryFnData
>(
  path: string,
  authToken?: string
) => {
  return async (body: TRequestData): Promise<TQueryFnData> => {
    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const formData = new FormData();
    for (const [key, value] of Object.entries(body)) {
      formData.append(key, value);
    }

    return fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: headers,
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          throw new Error('Error ' + res.error);
        }
        return res.result;
      });
  };
};

export function useFormMutationFetcher<
  TRequestData extends Record<string, string | File>,
  TQueryFnData
>(path: string) {
  const userState = useUserState();

  return useMemo(
    () =>
      createFormMutationFetcher<TRequestData, TQueryFnData>(
        path,
        userState.status !== UserStateStatus.SIGNED_OUT
          ? userState.token
          : undefined
      ),
    [path, userState]
  );
}
