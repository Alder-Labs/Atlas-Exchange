import { useQuery } from 'react-query';

import { useFetcher } from '../../lib/fetcher';
import { QueryProps } from '../../lib/queryProps';

import type { WithdrawalFee } from '../../lib/types';

interface WithdrawalFeeInput {
  coin: string;
  address: string;
  method: string;
  size: number;
}

export function useWithdrawalFees(
  input: WithdrawalFeeInput,
  props: QueryProps<WithdrawalFee> = {}
) {
  const { coin, address, method, size } = input;

  const queryString = `?coin=${coin}&address=${address}&method=${method}&size=${size}`;

  const { data, error, isLoading } = useQuery(
    `/proxy/api/wallet/withdrawal_fee${queryString}`,
    useFetcher<WithdrawalFee>(),
    props
  );

  return {
    data,
    error: <Error>error,
    isLoading,
  };
}
