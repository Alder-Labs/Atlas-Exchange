import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { WithdrawLimits } from '../lib/types';

export function useWithdrawalLimits(props: QueryProps<WithdrawLimits> = {}) {
  const { data, error, isLoading } = useQuery(
    '/proxy/api/wallet/withdrawal_limits',
    useFetcher<WithdrawLimits>(),
    props
  );

  return {
    data,
    error: <Error>error,
    isLoading,
  };
}
