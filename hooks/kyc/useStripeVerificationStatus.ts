import { useQuery } from 'react-query';

import { useFetcher } from '../../lib/fetcher';
import { QueryProps } from '../../lib/queryProps';

export function useStripeVerificationStatus(props: QueryProps<string> = {}) {
  const { data, error, isLoading, refetch } = useQuery(
    '/proxy/api/kyc/stripe_verification_status',
    useFetcher<string>(),
    props
  );

  return {
    data,
    error: <Error>error,
    refetch,
    isLoading,
  };
}
