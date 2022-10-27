import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useUserState } from '../lib/auth-token-context';
import { useFetcher } from '../lib/fetcher';
import { QueryProps } from '../lib/queryProps';
import { UserStateStatus } from '../lib/types/user-states';

export interface Owner {
  addresses: Address[];
  emails: {
    data: string;
    primary: boolean;
    type: string;
  }[];
  names: string[];
  phone_numbers: {
    data: string;
    primary: boolean;
    type: string;
  }[];
}

export interface Address {
  data: {
    city: string;
    country: string;
    postal_code: string;
    region: string;
    street: string;
  };
  primary: boolean;
}

export interface BillingInfo {
  city: string;
  name?: string;
  line1: string;
  country: string;
  district: string;
  postalCode: string;
}

export interface Identity {
  account_id: string;
  balances: Balances;
  mask: string;
  name: string;
  official_name: string;
  owners: Owner[];
  subtype: string;
  type: string;
}

export interface Balances {
  available: number;
  current: number;
  iso_currency_code: string;
  limit: null;
  unofficial_currency_code: null;
}

export enum BankAccountStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_DEPOSIT_VERIFICATION = 'needs_deposit_verification',
  PENDING_PLAID_VERIFICATION = 'pending_plaid_verification',
}

export interface BankAccount {
  id: number;
  name: string;
  time: Date;
  billingInfo: BillingInfo;
  needsAction: boolean;
  identity: Identity;
  needsPlaidUpdate: boolean;
  needsBillingInfo: boolean;
  needsPlaidManualVerification: boolean;
  candidateBillingInfoNames: string[];
  candidateBillingInfoAddresses: BillingInfo[];
  earlyCreditEligible: boolean;
  status: BankAccountStatus;
  data: {
    mask: string;
    institutionName: string;
  } | null;
  requiresKyc2: boolean;
}

export function useBankAccounts(props: QueryProps<BankAccount[]> = {}) {
  const userState = useUserState();
  const { data, error, isLoading, refetch } = useQuery(
    '/proxy/api/ach/accounts',
    useFetcher<BankAccount[]>(),
    {
      ...props,
      enabled:
        userState.status === UserStateStatus.SIGNED_IN &&
        (props.enabled ?? true),
    }
  );

  const bankAccountsMap = useMemo(() => {
    if (!data) {
      return null;
    }

    return data.reduce((acc, bankAccount) => {
      acc[bankAccount.id] = bankAccount;
      return acc;
    }, {} as Record<number, BankAccount>);
  }, [data]);

  const hasAtLeastOneBankAccount = useMemo(() => {
    if (!data) {
      return false;
    }
    return data.length > 0;
  }, [data]);

  return useMemo(
    () => ({
      data,
      error: <Error>error,
      isLoading,
      refetch,
      bankAccountsMap,
      hasAtLeastOneBankAccount,
    }),
    [data, error, isLoading, refetch, bankAccountsMap, hasAtLeastOneBankAccount]
  );
}
