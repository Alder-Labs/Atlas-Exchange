import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useUserState } from '../lib/auth-token-context';
import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';
import { UserStateStatus } from '../lib/types/user-states';

import type { Notification } from '../lib/types/notification';

export function useNotifications(props: QueryProps<Notification[]> = {}) {
  const userState = useUserState();
  const { data, error, isLoading, refetch } = useQuery(
    '/proxy/api/notifications/get_for_user',
    useFetcher<Notification[]>(),
    {
      ...props,
      enabled:
        userState.status === UserStateStatus.SIGNED_IN &&
        (props.enabled ?? true),
    }
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
