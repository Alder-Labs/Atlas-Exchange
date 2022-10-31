import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../../lib/fetcher';
import { QueryProps } from '../../lib/queryProps';

import type { DepositAddress } from '../../lib/types';

export function useDepositAddress(
  input: { coinId: string; method?: string },
  props: QueryProps<DepositAddress> = {}
) {
  const params: Record<string, string> = {};
  if (input?.method) {
    params['method'] = input.method;
  }
  const paramString = new URLSearchParams(params).toString();
  const fullParamString = paramString ? `?${paramString}` : '';

  const { coinId } = input;
  const { data, error, isLoading } = useQuery(
    `/proxy/api/wallet/deposit_address/${coinId}${fullParamString}`,
    useFetcher<DepositAddress>(),
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
