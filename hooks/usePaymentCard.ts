import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { Card } from '../lib/types';

export function usePaymentCard(cardId: string) {
  const { data, error, isLoading, refetch } = useQuery(
    `/proxy/api/card/${cardId}`,
    useFetcher<Card>()
  );

  return useMemo(
    () => ({
      data,
      error: <Error>error,
      refetch,
      isLoading,
    }),
    [data, error, refetch, isLoading]
  );
}
