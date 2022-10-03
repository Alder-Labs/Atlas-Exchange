import { useMemo, useCallback } from 'react';

import { AuthStatus, useAuthStatus } from '../../hooks/useKycLevel';
import { useModalState } from '../../hooks/useModalState';
import { ModalState } from '../../lib/types/modalState';

export function useRedirectHandlers() {
  const [authModalState, setAuthModalState] = useModalState();
  const { authStatus } = useAuthStatus();

  // Returns true if user passes all checks
  const requireAuthStatus = useCallback(
    (requiredStatus: AuthStatus) => {
      console.log('requireAuthStatus', requiredStatus, authStatus);
      if (authStatus === AuthStatus.Loading) {
        return true;
      }

      if (requiredStatus < AuthStatus.NotLoggedIn) return true;
      if (authStatus === AuthStatus.NotLoggedIn) {
        setAuthModalState({ state: ModalState.SignIn });
        return false;
      }

      if (requiredStatus < AuthStatus.KycLevel1) return true;
      if (authStatus < AuthStatus.KycLevel1) {
        setAuthModalState({ state: ModalState.Kyc1Required });
        return false;
      }

      if (requiredStatus < AuthStatus.KycLevel2) return true;
      if (authStatus < AuthStatus.KycLevel2) {
        setAuthModalState({ state: ModalState.Kyc2Required });
        return false;
      }

      return true;
    },
    [authStatus, setAuthModalState]
  );

  return useMemo(() => {
    return { requireAuthStatus };
  }, [requireAuthStatus]);
}
