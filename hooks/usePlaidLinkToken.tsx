import { useEffect } from 'react';

import { useMutation } from 'react-query';

import { useUserState } from '../lib/auth-token-context';
import { useMutationFetcher } from '../lib/mutation';

export function usePlaidLinkToken() {
  const userState = useUserState();
  const isLoggedIn = !!userState.user;

  const { mutate, data: plaidLinkTokenData } = useMutation(
    useMutationFetcher<
      {
        products: string[];
      },
      {
        expiration: string;
        link_token: string;
        request_id: string;
      }
    >('/proxy/api/ach/accounts/link_token')
  );

  useEffect(() => {
    if (isLoggedIn) {
      mutate({
        products: ['auth'],
      });
    }
  }, [mutate, isLoggedIn]);

  console.log(plaidLinkTokenData?.expiration);

  return plaidLinkTokenData;
}
