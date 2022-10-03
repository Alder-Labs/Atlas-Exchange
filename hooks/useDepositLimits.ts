import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { DepositLimits } from '../lib/types';

export function useDepositLimits(props: QueryProps<DepositLimits> = {}) {
  const { data, error, isLoading } = useQuery(
    '/proxy/api/wallet/deposit_limits',
    useFetcher<DepositLimits>(),
    props
  );

  return {
    data,
    error: <Error>error,
    isLoading,
  };
}
