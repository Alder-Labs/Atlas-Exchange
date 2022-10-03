import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { CoinBalance } from '../lib/types';

export function useBalances(props: QueryProps<CoinBalance[]> = {}) {
  const {
    data: balancesData,
    error,
    isLoading,
    refetch,
  } = useQuery(
    '/proxy/api/wallet/balances',
    useFetcher<CoinBalance[]>(),
    props
  );

  const balancesMap = useMemo(() => {
    if (!balancesData) {
      return null;
    }

    return balancesData.reduce((acc, bal) => {
      acc[bal.coin] = bal;
      return acc;
    }, {} as Record<string, CoinBalance>);
  }, [balancesData]);

  return useMemo(() => {
    return {
      balances: balancesData,
      error: <Error>error,
      refetch,
      isLoading,
      balancesMap,
    };
  }, [balancesData, balancesMap, error, isLoading, refetch]);
}
