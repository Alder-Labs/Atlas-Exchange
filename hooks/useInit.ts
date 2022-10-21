import { useUserState } from '../lib/auth-token-context';

import { useBankAccounts } from './useBankAccounts';
import { useDepositLimits } from './useDepositLimits';

export function useInit() {
  const userState = useUserState();
  const isLoggedIn = !!userState.user;

  useBankAccounts();
  useDepositLimits();
}
