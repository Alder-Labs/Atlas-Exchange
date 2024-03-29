import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../../lib/fetcher';
import { QueryProps } from '../../lib/queryProps';

import type { Market } from '../../lib/types';

export function useMarkets(props: QueryProps<Market[]> = {}) {
  const { data, error, isLoading, refetch } = useQuery(
    '/proxy/api/markets',
    useFetcher<Market[]>(),
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
