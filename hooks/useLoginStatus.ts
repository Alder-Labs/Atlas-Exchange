import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';

import type { LoginStatus } from '../lib/types';

export function useLoginStatus(props: QueryProps<LoginStatus> = {}) {
  const { onError, onSuccess } = props;

  const { data, error, isLoading, refetch, status } = useQuery(
    '/api/login_status',
    useFetcher<LoginStatus>(),
    props
  );

  return {
    data,
    status,
    error: <Error>error,
    refetch,
    isLoading,
  };
}
