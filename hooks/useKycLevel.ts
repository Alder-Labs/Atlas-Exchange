import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useUserState } from '../lib/auth-token-context';
import { useFetcher } from '../lib/fetcher';

import { useLoginStatus } from './useLoginStatus';

export enum AuthStatus {
  // Should never happen, but just in case.
  Unknown = 0,

  Error = 1,
  Loading = 2,

  Rejected = -1,

  // Order matters here. The higher the number, the more access the user has.
  NotLoggedIn = 3,
  KycLevel0 = 4,
  KycLevel1 = 5,
  KycLevel2 = 6,
}

type HookResult =
  | {
      authStatus: AuthStatus.Error;
      error: { message: string };
    }
  | { authStatus: AuthStatus.Loading }
  | { authStatus: AuthStatus.NotLoggedIn }
  | { authStatus: AuthStatus.KycLevel0 }
  | {
      authStatus: AuthStatus.KycLevel1;
      level2AppStatus: 'pending' | 'actions-needed' | 'not-submitted';
    }
  | { authStatus: AuthStatus.KycLevel2 }
  | { authStatus: AuthStatus.Rejected }
  | { authStatus: AuthStatus.Unknown };

export function useAuthStatus(): HookResult {
  const {
    data: loginStatusData,
    error: loginStatusError,
    refetch: loginStatusRefetch,
    isLoading: loginStatusIsLoading,
  } = useLoginStatus();

  const userState = useUserState();

  return useMemo(() => {
    // Deal with userState
    if (!userState.user) return { authStatus: AuthStatus.NotLoggedIn };

    // Deal with login status hook
    if (loginStatusIsLoading) return { authStatus: AuthStatus.Loading };
    if (loginStatusError)
      return { authStatus: AuthStatus.Error, error: loginStatusError };

    const user = loginStatusData?.user;
    if (!user) {
      // User going  through MFA
      return { authStatus: AuthStatus.NotLoggedIn };
    }

    switch (user.kycLevel) {
      case 2:
        return { authStatus: AuthStatus.KycLevel2 };
      case 1:
        if (user.kycApplicationStatus === 'submitted') {
          return {
            authStatus: AuthStatus.KycLevel1,
            level2AppStatus: 'pending',
          };
        } else if (user.kycApplicationStatus === 'action_needed') {
          return {
            authStatus: AuthStatus.KycLevel1,
            level2AppStatus: 'actions-needed',
          };
        } else {
          return {
            authStatus: AuthStatus.KycLevel1,
            level2AppStatus: 'not-submitted',
          };
        }
      case 0:
        return { authStatus: AuthStatus.KycLevel0 };
      case -1:
        return { authStatus: AuthStatus.Rejected };
      default:
        return { authStatus: AuthStatus.Unknown };
    }
  }, [
    userState.user,
    loginStatusIsLoading,
    loginStatusError,
    loginStatusData?.user,
  ]);
}
