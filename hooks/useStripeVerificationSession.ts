import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';
import { StripeVerificationSession } from '../lib/types/kyc';

export function useStripeVerificationSession(
  props: QueryProps<StripeVerificationSession> = {}
) {
  const { data, error, isLoading, refetch } = useQuery(
    `/proxy/api/kyc/create_stripe_session`,
    useFetcher<StripeVerificationSession>(),
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
