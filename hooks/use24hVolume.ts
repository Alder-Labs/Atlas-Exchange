import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

export type Volume24h = {
  spot: number;
  derivative: number;
};

export function use24hVolume(props: QueryProps<Volume24h> = {}) {
  const { data, error, isLoading, refetch } = useQuery(
    '/proxy/api/stats/24h_volume',
    useFetcher<Volume24h>(),
    props
  );

  return useMemo(() => {
    return {
      data,
      error: <Error>error,
      isLoading,
      refetch,
    };
  }, [data, error, isLoading, refetch]);
}
