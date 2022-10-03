import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { UsdValueHistory } from '../lib/types';

interface UsdValueSnapshotsQuery {
  startTime?: number;
  endTime?: number;
  limit: number;
}

export function useUsdValueSnapshots(
  input: UsdValueSnapshotsQuery,
  props: QueryProps<UsdValueHistory> = {}
) {
  const { limit, startTime, endTime } = input;

  const params: Record<string, string> = {
    limit: limit.toString(),
  };
  if (startTime) {
    params['start_time'] = startTime.toString();
  }
  if (endTime) {
    params['end_time'] = endTime.toString();
  }
  const paramString = new URLSearchParams(params).toString();
  const fullParamString = paramString ? `?${paramString}` : '';

  const { data, error, isLoading } = useQuery(
    `/proxy/api/wallet/usd_value_snapshots${fullParamString}`,
    useFetcher<UsdValueHistory>(),
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
