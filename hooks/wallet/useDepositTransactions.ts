import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../../lib/fetcher';
import { QueryProps } from '../../lib/queryProps';

import type { DepositTransaction } from '../../lib/types';

export function useDepositTransactions(
  input: {
    startTime?: number;
    endTime?: number;
  } = {},
  props: QueryProps<DepositTransaction[]> = {}
) {
  const { onError, onSuccess } = props;

  const params: Record<string, string> = {};
  if (input.startTime) {
    params['start_time'] = input.startTime.toString();
  }
  if (input.endTime) {
    params['end_time'] = input.endTime.toString();
  }
  const paramString = new URLSearchParams(params).toString();
  const fullParamString = paramString ? `?${paramString}` : '';
  const url = `/proxy/api/wallet/deposits${fullParamString}`;

  const { data, error, isLoading } = useQuery(
    url,
    useFetcher<DepositTransaction[]>(),
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
