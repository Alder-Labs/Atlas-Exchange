import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { Support } from '../lib/types';

export function useSupportTickets(props: QueryProps<Support[]> = {}) {
  const { data, error, isLoading, refetch } = useQuery(
    '/proxy/api/support/tickets',
    useFetcher<Support[]>(),
    props
  );

  return useMemo(
    () => ({
      data,
      error: <Error>error,
      refetch,
      isLoading,
    }),
    [data, error, refetch, isLoading]
  );
}
