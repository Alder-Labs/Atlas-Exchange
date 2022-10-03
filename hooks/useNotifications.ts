import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { Notification } from '../lib/types/notification';

export function useNotifications(props: QueryProps<Notification[]> = {}) {
  const { data, error, isLoading, refetch } = useQuery(
    '/proxy/api/notifications/get_for_user',
    useFetcher<Notification[]>(),
    props
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
