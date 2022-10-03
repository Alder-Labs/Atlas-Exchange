import { useMemo } from 'react';

import { useUser, useUserState } from './auth-token-context';

export const createFormMutationFetcher = <TRequestData, TQueryFnData>(
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

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
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

export function useFormMutationFetcher<TRequestData, TQueryFnData>(
  path: string
) {
  const userState = useUserState();

  return useMemo(
    () =>
      createFormMutationFetcher<TRequestData, TQueryFnData>(
        path,
        userState?.user?.token
      ),
    [path, userState?.user?.token]
  );
}
