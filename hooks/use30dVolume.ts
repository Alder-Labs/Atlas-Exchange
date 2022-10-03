import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

export function use30dVolume(props: QueryProps<string> = {}) {
  const { data, error, isLoading, refetch } = useQuery(
    '/proxy/api/stats/30d_volume',
    useFetcher<string>(),
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
