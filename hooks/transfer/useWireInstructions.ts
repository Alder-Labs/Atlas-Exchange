import { useQuery } from 'react-query';

import { useFetcher } from '../../lib/fetcher';
import { QueryProps } from '../../lib/queryProps';

import type { WireInstruction } from '../../lib/types';

export function useWireInstructions(
  coinId: string,
  props: QueryProps<WireInstruction> = {}
) {
  const { data, error, isLoading, refetch } = useQuery(
    `/proxy/api/wallet/${coinId}/fiat_deposit_instructions`,
    useFetcher<WireInstruction>(),
    props
  );

  return {
    data,
    error: <Error>error,
    refetch,
    isLoading,
  };
}
