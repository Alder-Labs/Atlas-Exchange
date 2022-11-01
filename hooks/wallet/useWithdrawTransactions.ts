import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../../lib/fetcher';
import { QueryProps } from '../../lib/queryProps';

import type { WithdrawTransaction } from '../../lib/types';

export function useWithdrawTransactions(
  input?: {
    startTime?: number;
    endTime?: number;
  },
  props: QueryProps<WithdrawTransaction[]> = {}
) {
  const params: Record<string, string> = {};
  if (input?.startTime) {
    params['start_time'] = input?.startTime.toString();
  }
  if (input?.endTime) {
    params['end_time'] = input?.endTime.toString();
  }

  const paramString = new URLSearchParams(params).toString();
  const fullParamString = paramString ? `?${paramString}` : '';
  const url = `/proxy/api/wallet/withdrawals${fullParamString}`;

  const { data, error, isLoading } = useQuery(
    url,
    useFetcher<WithdrawTransaction[]>(),
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
