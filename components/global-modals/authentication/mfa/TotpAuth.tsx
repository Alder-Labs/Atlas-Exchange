import React, { useCallback, useEffect, useState } from 'react';

import { useModalState } from '../../../../hooks/modal';
import { useUserState } from '../../../../lib/auth-token-context';
import { toast } from '../../../../lib/toast';
import { ModalState } from '../../../../lib/types/modalState';
import { UserStateStatus } from '../../../../lib/types/user-states';
import { Button, Text, TextInput } from '../../../base';
import { TitledModal } from '../../../modals/TitledModal';

export const TotpAuth = () => {
  const userState = useUserState();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const [modalState, setModalState] = useModalState();

  const onSignInWithMfa = useCallback(
    (code: string) => {
      setIsLoggingIn(true);
      if (userState.status === UserStateStatus.NEEDS_MFA) {
        userState
          .signInWithMfa({ code: code })
          .then(async () => {
            setModalState({ state: ModalState.Closed });
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
    [setModalState, userState]
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

  /**
   * If user reloads page, open this modal if needed
   */
  useEffect(() => {
    if (
      userState.status === UserStateStatus.NEEDS_MFA &&
      userState.loginStatusData.mfaRequired === 'sms' &&
      modalState.state === ModalState.Closed
    ) {
      setModalState({ state: ModalState.TotpAuth });
    }
  }, [modalState.state, setModalState, userState]);

  return (
    <TitledModal
      title="Two-factor authentication required"
      isOpen={modalState.state === ModalState.TotpAuth}
      darkenBackground={false}
      onGoBack={() => {
        if (userState.status !== UserStateStatus.SIGNED_OUT) {
          setIsSigningOut(true);
          userState
            .signOut()
            .catch((err: Error) => {
              toast.error(`Error: ${err.message}`);
            })
            .finally(() => {
              setIsSigningOut(false);
            });
          setModalState({ state: ModalState.SignIn });
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
          autoFocus={true}
          label="Code"
          disabled={isLoggingIn}
          value={mfaCode}
          onChange={(e) => {
            // Digits only
            setMfaCode(e.target.value.replace(/\D/g, ''));
          }}
        />
        <div className="h-4"></div>
        <Button type="submit" loading={isLoggingIn} onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </TitledModal>
  );
};
