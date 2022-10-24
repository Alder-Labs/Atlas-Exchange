import { useQuery } from 'react-query';

import { useUserState } from '../lib/auth-token-context';
import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { DepositLimits } from '../lib/types';

export function useDepositLimits(props: QueryProps<DepositLimits> = {}) {
  const userState = useUserState();
  const { data, error, isLoading } = useQuery(
    '/proxy/api/wallet/deposit_limits',
    useFetcher<DepositLimits>(),
    {
      ...props,
      enabled:
        userState.user?.status === 'logged-in' && (props.enabled ?? true),
    }
  );

  return {
    data,
    error: <Error>error,
    isLoading,
  };
}
