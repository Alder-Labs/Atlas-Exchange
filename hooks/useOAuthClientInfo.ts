import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { Market, OauthClientInfo } from '../lib/types';

export function useOAuthClientInfo(
  input: { clientId: string },
  props: QueryProps<OauthClientInfo> = {}
) {
  const { data, error, isLoading, refetch } = useQuery(
    `/api/oauth2/client_info?client_id=${input.clientId}`,
    useFetcher<OauthClientInfo[]>(),
    props
  );

  return useMemo(
    () => ({
      data,
      error: <Error>error,
      isLoading,
      refetch,
    }),
    [data, error, isLoading, refetch]
  );
}
