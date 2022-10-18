import { useMemo } from 'react';

import { useAtom } from 'jotai';
import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { watchBalanceUntilAtom } from '../lib/jotai';
import { QueryProps } from '../lib/queryProps';

import { useCurrentDate } from './useCurrentDate';

import type { CoinBalance } from '../lib/types';

export function useBalances(props: QueryProps<CoinBalance[]> = {}) {
  const [watchBalancesUntil] = useAtom(watchBalanceUntilAtom);
  const currentDate = useCurrentDate();
  const shouldWatchBalances = useMemo(
    () => currentDate.getTime() < watchBalancesUntil,
    [currentDate, watchBalancesUntil]
  );

  const {
    data: balancesData,
    error,
    isLoading,
    refetch,
  } = useQuery('/proxy/api/wallet/balances', useFetcher<CoinBalance[]>(), {
    refetchInterval: shouldWatchBalances ? 1000 * 2 : false, // 2 seconds
    ...props,
  });

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
