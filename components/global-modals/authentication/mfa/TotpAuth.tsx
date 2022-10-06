import React, { useCallback, useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { useLoginStatus } from '../../../../hooks/useLoginStatus';
import { useModalState } from '../../../../hooks/useModalState';
import { useUserState } from '../../../../lib/auth-token-context';
import { toast } from '../../../../lib/toast';
import { ModalState } from '../../../../lib/types/modalState';
import { Button, Text, TextInput } from '../../../base';
import { TitledModal } from '../../../modals/TitledModal';
import { TitledCard } from '../../../TitledCard';

export const TotpAuth = () => {
  const userState = useUserState();
  const router = useRouter();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const [authModalState, setAuthModalState] = useModalState();
  const { refetch: refetchLoginStatus } = useLoginStatus();

  const onSignInWithMfa = useCallback(
    (code: string) => {
      setIsLoggingIn(true);
      if (userState.user) {
        userState
          .signinWithMfa({ code: code })
          .then(async () => {
            await refetchLoginStatus();
            setAuthModalState({ state: ModalState.Closed });
          })
          .catch((err: Error) => {
            toast.error(`Error: ${err.message}`);
          })
          .finally(() => {
            setIsLoggingIn(false);
          });
      } else {
        setIsLoggingIn(false);
      }
    },
    [refetchLoginStatus, setAuthModalState, userState]
  );

  const handleSubmit = useCallback(() => {
    if (mfaCode.length === 6) {
      onSignInWithMfa(mfaCode);
      setMfaCode('');
    }
  }, [mfaCode, onSignInWithMfa]);

  useEffect(() => {
    handleSubmit();
  }, [handleSubmit]);

  return (
    <TitledModal
      title="Two-factor authentication required"
      isOpen={authModalState.state === ModalState.TotpAuth}
      darkenBackground={false}
      onGoBack={() => {
        if (userState.user) {
          userState.signout();
          setAuthModalState({ state: ModalState.SignIn });
        }
      }}
      showCloseButton={false}
    >
      <div className="p-6">
        <Text>
          Please enter a 6-digit verification code from your Google
          Authenticator or Authy app.
        </Text>
        <div className="h-1"></div>
        <TextInput
          label="Code"
          disabled={isLoggingIn}
          value={mfaCode}
          onChange={(e) => {
            // Digits only
            setMfaCode(e.target.value.replace(/\D/g, ''));
          }}
        />
        <div className="h-4"></div>
        <Button loading={isLoggingIn} onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </TitledModal>
  );
};
