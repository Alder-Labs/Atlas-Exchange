import { useCallback, useEffect, useMemo } from "react";

import { useMutation } from "react-query";

import { useUserState } from "../lib/auth-token-context";
import { useMutationFetcher } from "../lib/mutation";

export function usePlaidLinkToken() {
  const userState = useUserState();
  const isLoggedIn = !!userState.user;

  const {
    mutate,
    data: plaidLinkTokenData,
    mutateAsync,
  } = useMutation(
    useMutationFetcher<
      {
        products: string[];
      },
      {
        expiration: string;
        link_token: string;
        request_id: string;
      }
    >("/proxy/api/ach/accounts/link_token")
  );

  useEffect(() => {
    if (isLoggedIn) {
      mutate({
        products: ["auth"],
      });
    }
  }, [mutate, isLoggedIn]);

  const getLinkToken = useCallback(async () => {
    if (plaidLinkTokenData) {
      // Check if expired
      const expiration = new Date(plaidLinkTokenData.expiration);
      const now = new Date();
      console.log("expiration", expiration);
      console.log("now", now);
      if (expiration > now) {
        return plaidLinkTokenData.link_token;
      }
    }

    return mutateAsync({
      products: ["auth"],
    }).then((data) => data.link_token);
  }, [mutateAsync, plaidLinkTokenData]);

  return useMemo(
    () => ({ getLinkToken, plaidLinkTokenData }),
    [getLinkToken, plaidLinkTokenData]
  );
}
