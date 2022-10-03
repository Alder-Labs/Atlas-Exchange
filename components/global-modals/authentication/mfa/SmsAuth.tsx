import React, { useCallback, useEffect, useState } from 'react';

import { useMutation } from 'react-query';

import { useLoginStatus } from '../../../../hooks/useLoginStatus';
import { useModalState } from '../../../../hooks/useModalState';
import { useUserState } from '../../../../lib/auth-token-context';
import { useMutationFetcher } from '../../../../lib/mutation';
import { toast } from '../../../../lib/toast';
import { ModalState } from '../../../../lib/types/modalState';
import { Button, Text, TextInput } from '../../../base';
import { TitledModal } from '../../../modals/TitledModal';

export const SmsAuth = () => {
  const userState = useUserState();
  const [modalState, setModalState] = useModalState();
  const { refetch: refetchLoginStatus } = useLoginStatus();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [code, setCode] = useState('');

  const onSignInWithMfa = useCallback(
    (smsCode: string) => {
      setIsLoggingIn(true);
      if (userState.user) {
        userState
          .signinWithMfa({ code: smsCode })
          .then(async () => {
            await refetchLoginStatus();
            setModalState({ state: ModalState.Closed });
          })
          .catch((err: Error) => {
            toast.error(`Error: ${err.message}`);
          })
          .finally(() => {
            setCode('');
            setIsLoggingIn(false);
          });
      } else {
        setIsLoggingIn(false);
      }
    },
    [refetchLoginStatus, setModalState, userState]
  );

  const handleSubmit = useCallback(() => {
    if (code.length === 6) {
      onSignInWithMfa(code);
      setCode('');
    }
  }, [code, onSignInWithMfa]);

  useEffect(() => {
    handleSubmit();
  }, [handleSubmit]);

  const { isLoading: requestSmsLoading, mutate: requestSms } = useMutation(
    useMutationFetcher<{ phoneNumber: string }, {}>(
      `/proxy/api/mfa/sms/request`
    ),
    {
      onSuccess: (data) => {
        toast.success('Successfully requested phone verification');
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  // Request SMS verification code is sent to phone
  const onRequestSmsCode = useCallback(async () => {
    requestSms({
      phoneNumber: '',
    });
  }, [requestSms]);

  useEffect(() => {
    if (modalState.state === ModalState.SmsAuth) {
      onRequestSmsCode();
    }
  }, [modalState, onRequestSmsCode]);

  return (
    <TitledModal
      title="Two-factor authentication required"
      isOpen={modalState.state === ModalState.SmsAuth}
      darkenBackground={false}
      onGoBack={() => {
        if (userState.user) {
          userState.signout();
          setModalState({ state: ModalState.SignIn });
        }
      }}
      onClickCloseButton={() => {
        if (userState.user) {
          userState.signout();
          setModalState({ state: ModalState.Closed });
        }
      }}
    >
      <div className="p-6">
        <Text>Please enter a 6-digit SMS code sent to your phone.</Text>
        <div className="h-4"></div>
        <TextInput
          label="Code"
          value={code}
          onChange={(e) => {
            // Digits only
            setCode(e.target.value.replace(/\D/g, ''));
          }}
          renderSuffix={() => (
            <Button
              size="sm"
              rounded="md"
              onClick={onRequestSmsCode}
              loading={requestSmsLoading}
              type="button"
              className="mr-2"
            >
              {requestSmsLoading ? 'Sending...' : 'Resend SMS'}
            </Button>
          )}
          className="w-full"
        />
        <div className="h-6"></div>
        <Button loading={isLoggingIn} onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </TitledModal>
  );
};
