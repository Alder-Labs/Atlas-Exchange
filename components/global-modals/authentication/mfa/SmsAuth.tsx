import React, { useCallback, useEffect, useState } from 'react';

import { useMutation } from 'react-query';

import { useCurrentDate } from '../../../../hooks/useCurrentDate';
import { useLoginStatus } from '../../../../hooks/useLoginStatus';
import { useModalState } from '../../../../hooks/useModalState';
import { useUserState } from '../../../../lib/auth-token-context';
import { useMutationFetcher } from '../../../../lib/mutation';
import { toast } from '../../../../lib/toast';
import { ModalState } from '../../../../lib/types/modalState';
import { Button, Text, TextInput } from '../../../base';
import { TitledModal } from '../../../modals/TitledModal';

const SECONDS_BETWEEN_RESEND_CODE = 59;

export const SmsAuth = () => {
  const userState = useUserState();
  const [modalState, setModalState] = useModalState();
  const { refetch: refetchLoginStatus, data: loginStatusData } =
    useLoginStatus();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [code, setCode] = useState('');

  const currentDate = useCurrentDate();
  const [codeLastSent, setCodeLastSent] = useState<Date | null>(null);

  const secondsRemaining = Math.max(
    0,
    codeLastSent
      ? SECONDS_BETWEEN_RESEND_CODE -
          Math.floor((currentDate.getTime() - codeLastSent.getTime()) / 1000)
      : 0
  );

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
        setCodeLastSent(new Date());
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

  /**
   * If user reloads page, open this modal if needed
   */
  useEffect(() => {
    if (
      loginStatusData?.mfaRequired === 'sms' &&
      modalState.state === ModalState.Closed
    ) {
      setModalState({ state: ModalState.SmsAuth });
    }
  }, [loginStatusData, modalState, setModalState]);

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
      showCloseButton={false}
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
              disabled={secondsRemaining > 0}
            >
              {requestSmsLoading
                ? 'Sending...'
                : secondsRemaining
                ? `Resend (${secondsRemaining})`
                : `Resend SMS`}
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
