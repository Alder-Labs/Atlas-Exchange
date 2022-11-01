import { useQuery } from 'react-query';

import { useUserState } from '../../lib/auth-token-context';
import { useFetcher } from '../../lib/fetcher';
import { QueryProps } from '../../lib/queryProps';
import { UserStateStatus } from '../../lib/types/user-states';

import type { WithdrawLimits } from '../../lib/types';

export function useWithdrawalLimits(props: QueryProps<WithdrawLimits> = {}) {
  const userState = useUserState();
  const { data, error, isLoading } = useQuery(
    '/proxy/api/wallet/withdrawal_limits',
    useFetcher<WithdrawLimits>(),
    {
      ...props,
      enabled:
        userState.status === UserStateStatus.SIGNED_IN &&
        (props.enabled ?? true),
    }
  );

  return {
    data,
    error: <Error>error,
    isLoading,
  };
}
