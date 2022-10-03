import { useMemo } from 'react';

import { useQuery } from 'react-query';
import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { Candle } from '../lib/types';

interface MarketCandlesInput {
  market: string;
  resolution: number;
  startTime?: number;
  endTime?: number;
  limit?: number;
}

export function useMarketCandles(
  input: MarketCandlesInput,
  props: QueryProps<Candle[]> = {}
) {
  const { market, resolution, startTime, endTime, limit } = input;

  const params: Record<string, string> = {
    resolution: resolution.toString(),
  };
  if (startTime) {
    params['start_time'] = startTime.toString();
  }
  if (endTime) {
    params['end_time'] = endTime.toString();
  }
  if (limit) {
    params['limit'] = limit.toString();
  }
  const paramString = new URLSearchParams(params).toString();
  const fullParamString = paramString ? `?${paramString}` : '';

  const { data, error, isLoading } = useQuery(
    `/proxy/api/markets/${market}/candles${fullParamString}`,
    useFetcher<Candle[]>(),
    props
  );

  return useMemo(
    () => ({
      data,
      error: <Error>error,
      isLoading,
    }),
    [data, error, isLoading]
  );
}
