import React from 'react';

import { useLoginStatus } from '../../hooks/useLoginStatus';
import { useModalState } from '../../hooks/useModalState';
import { useUserState } from '../../lib/auth-token-context';
import { toast } from '../../lib/toast';
import { ModalState } from '../../lib/types/modalState';
import { Button, Text } from '../base';

export function NavbarProfile() {
  const [modalState, setModalState] = useModalState();

  const userState = useUserState();
  if (!userState.user) {
    throw new Error('NavbarProfile: User not logged in');
  }

  const { data: loginStatusData, error } = useLoginStatus();

  return (
    <div className="flex items-center space-x-4">
      <Text className="text-sm">
        {loginStatusData?.loggedIn ? loginStatusData.user.displayName : null}
      </Text>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setModalState({ state: ModalState.DepositFiat });
        }}
      >
        Deposit
      </Button>
      <Button
        size="sm"
        onClick={() => {
          userState.signout();
        }}
      >
        Sign out
      </Button>
    </div>
  );
}
