import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { SupportTicket } from '../lib/types';

export function useSupportTickets(props: QueryProps<SupportTicket[]> = {}) {
  const { data, error, isLoading, refetch } = useQuery(
    '/proxy/api/support/tickets',
    useFetcher<SupportTicket[]>(),
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
