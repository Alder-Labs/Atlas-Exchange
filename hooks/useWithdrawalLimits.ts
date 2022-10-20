import { useQuery } from 'react-query';

import { useUserState } from '../lib/auth-token-context';
import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { WithdrawLimits } from '../lib/types';

export function useWithdrawalLimits(props: QueryProps<WithdrawLimits> = {}) {
  const userState = useUserState();
  const { data, error, isLoading } = useQuery(
    '/proxy/api/wallet/withdrawal_limits',
    useFetcher<WithdrawLimits>(),
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
