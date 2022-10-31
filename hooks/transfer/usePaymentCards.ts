import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../../lib/fetcher';
import { Card } from '../../lib/types';

export function usePaymentCards() {
  const { data, error, isLoading, refetch } = useQuery(
    '/proxy/api/cards',
    useFetcher<Card[]>()
  );

  const cardsMap = useMemo(() => {
    if (!data) {
      return null;
    }
    return data.reduce((acc, bal) => {
      acc[bal.id] = bal;
      return acc;
    }, {} as Record<string, Card>);
  }, [data]);

  return useMemo(() => {
    return {
      cards: data,
      error: <Error>error,
      cardsMap,
      refetch,
      isLoading,
    };
  }, [data, cardsMap, error, refetch, isLoading]);
}
