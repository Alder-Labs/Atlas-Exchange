import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { Market } from '../lib/types';

export function useMinimumWithdrawalSize(
  input: { coinId: string },
  props: QueryProps<Market[]> = {}
) {
  const { coinId } = input;
  const { data, error, isLoading, refetch } = useQuery(
    `/proxy/api/wallet/minimum_withdrawal_size/${coinId}`,
    useFetcher<number>(),
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
