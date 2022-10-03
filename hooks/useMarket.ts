import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { Market } from '../lib/types';

type MarketProps = {
  market: string;
  resolution: number;
  startTime?: number;
  endTime?: number;
  limit?: number;
};

export function useMarket(
  props: MarketProps,
  options: QueryProps<Market> = {}
) {
  const { market } = props;
  const { onSuccess, onError, enabled = true } = options;

  const { data, error, isLoading, refetch } = useQuery(
    `/proxy/api/markets/${market}`,
    useFetcher<Market>(),
    { onSuccess, onError, enabled }
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
