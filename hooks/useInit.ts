import { useUserState } from '../lib/auth-token-context';
import { UserStateStatus } from '../lib/types/user-states';

import { useBankAccounts } from './useBankAccounts';
import { useDepositLimits } from './useDepositLimits';

export function useInit() {
  const userState = useUserState();
  const isLoggedIn = userState.status === UserStateStatus.SIGNED_IN;

  useBankAccounts();
  useDepositLimits();
}
