import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../../lib/fetcher';
import { QueryProps } from '../../lib/queryProps';

import type { Fill } from '../../lib/types';

export function useFills(
  input: {
    includeOrderDetails?: boolean;
    limit?: number;
  } = {},
  props: QueryProps<Fill[]> = {}
) {
  const { onError, onSuccess } = props;

  const params: Record<string, string> = {};
  if (input.includeOrderDetails) {
    params['include_order_details'] = input.includeOrderDetails ? '1' : '0';
  }
  if (input.limit) {
    params['limit'] = input.limit.toString();
  }
  const paramString = new URLSearchParams(params).toString();
  const fullParamString = paramString ? `?${paramString}` : '';

  const { data, error, isLoading, refetch } = useQuery(
    `/proxy/api/fills${fullParamString}`,
    useFetcher<Fill[]>(),
    props
  );

  return useMemo(
    () => ({
      data,
      error: <Error>error,
      refetch,
      isLoading,
    }),
    [data, error, isLoading, refetch]
  );
}
