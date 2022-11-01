import React from 'react';

import { useUserState } from '../../lib/auth-token-context';

import { RemoveWithdrawalPasswordModal } from './RemoveWithdrawalPassword';
import { SetWithdrawalPasswordModal } from './SetWithdrawalPasswordModal';
import { UpdateWithdrawalPasswordModal } from './UpdateWithdrawalPasswordModal';

export function WithdrawalPasswordModal() {
  const userState = useUserState();
  const loginStatus = userState.loginStatusData;
  const hasWithdrawalPasswordSet =
    !!loginStatus?.user?.requireWithdrawalPassword;

  if (!hasWithdrawalPasswordSet) {
    return <SetWithdrawalPasswordModal />;
  }

  return (
    <div className="flex w-56 flex-col">
      <UpdateWithdrawalPasswordModal />
      <div className="h-4" />
      <RemoveWithdrawalPasswordModal />
    </div>
  );
}
