import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { Coin } from '../lib/types';

export function useCoins(props: QueryProps<Coin[]> = {}) {
  const {
    data: coinsData,
    error,
    isLoading,
  } = useQuery('/proxy/api/wallet/coins', useFetcher<Coin[]>(), props);

  const coinsMap = useMemo(() => {
    if (!coinsData) {
      return null;
    }
    return coinsData.reduce((acc, coin) => {
      acc[coin.id] = coin;
      return acc;
    }, {} as Record<string, Coin>);
  }, [coinsData]);

  return useMemo(() => {
    return {
      coins: coinsData,
      error: <Error>error,
      coinsMap,
      isLoading,
    };
  }, [coinsData, coinsMap, error, isLoading]);
}
