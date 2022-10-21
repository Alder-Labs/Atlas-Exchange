import { useMemo, useEffect, useState } from 'react';

import { useAtom } from 'jotai';
import { useQuery } from 'react-query';

import { useUserState } from '../lib/auth-token-context';
import { useFetcher } from '../lib/fetcher';
import { watchBalanceUntilAtom } from '../lib/jotai';
import { QueryProps } from '../lib/queryProps';

import type { CoinBalance } from '../lib/types';

export function useBalances(props: QueryProps<CoinBalance[]> = {}) {
  const [watchBalancesUntil] = useAtom(watchBalanceUntilAtom);
  const userState = useUserState();

  const [shouldWatch, setShouldWatch] = useState(false);
  useEffect(() => {
    // Every second, check if we should start watching the balances
    const interval = setInterval(() => {
      if (watchBalancesUntil > Date.now()) {
        setShouldWatch(true);
      } else {
        setShouldWatch(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [watchBalancesUntil]);

  useEffect(() => {});

  const {
    data: balancesData,
    error,
    isLoading,
    refetch,
  } = useQuery('/proxy/api/wallet/balances', useFetcher<CoinBalance[]>(), {
    refetchInterval: shouldWatch ? 1000 * 2 : false, // 2 seconds
    ...props,
    enabled: userState.user?.status === 'logged-in' && (props.enabled ?? true),
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
