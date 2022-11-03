import React, { useState } from 'react';

import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation } from 'react-query';

import { useModal, UseModalCallbacks } from '../../hooks/modal';
import { useUserState } from '../../lib/auth-token-context';
import { useDarkOrLightMode } from '../../lib/dark-mode';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { UserStateStatus } from '../../lib/types/user-states';
import { Button, Text, TextButton, TextInput } from '../base';
import { TitledModal } from '../modals/TitledModal';

import { WithdrawalPasswordWarning } from './WithdrawalPasswordWarning';

interface RemoveWithdrawalPassword {
  password: string;
  reset_token: string | null;
}

export function RemoveWithdrawalPasswordModal() {
  const darkMode = useDarkOrLightMode();
  const [open, handlers] = useModal(false);

  return (
    <>
      <Button
        className="w-56"
        onClick={handlers.open}
        variant={darkMode === 'dark' ? 'secondary' : 'outline'}
      >
        Disable Password
      </Button>
      <RemoveWithdrawalPasswordInner isOpen={open} handlers={handlers} />
    </>
  );
}

const RemoveWithdrawalPasswordInner = (props: {
  isOpen: boolean;
  handlers: UseModalCallbacks;
}) => {
  const { isOpen, handlers } = props;

  const userState = useUserState();
  const [showWarning, setShowWarning] = useState(true);

  const [oldPassword, setOldPassword] = useState('');
  const [passwordIsShowing, setPasswordIsShowing] = useState(false);
  const toggleShowPassword = () => {
    setPasswordIsShowing((prev) => !prev);
  };

  const {
    mutate: removeWithdrawalPassword,
    isLoading: isLoadingRemoveWithdrawalPassword,
  } = useMutation(
    useMutationFetcher<RemoveWithdrawalPassword, {}>(
      `/proxy/api/wallet/withdrawal_password`,
      {
        method: 'DELETE',
      }
    ),
    {
      onSuccess: (_) => {
        toast.success('Successfully removed withdrawal password');
        if (userState.status !== UserStateStatus.SIGNED_OUT) {
          userState.updateToken(userState.token).then(() => {
            handlers.close();
          });
        }
        setOldPassword('');
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  return (
    <TitledModal
      isOpen={isOpen}
      title={'Disable withdrawal password'}
      onClose={handlers.close}
    >
      <div>
        {showWarning && (
          <div className="flex flex-col items-center p-6">
            <WithdrawalPasswordWarning onClick={() => setShowWarning(false)} />
          </div>
        )}
        {!showWarning && (
          <div className="flex flex-col items-center p-6">
            <Text className="w-full text-left">
              Enter your existing withdrawal password to disable.
            </Text>
            <TextInput
              className="mt-4 w-full"
              type={passwordIsShowing ? 'text' : 'password'}
              label="Password"
              placeholder="Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              renderSuffix={() => (
                <TextButton
                  onClick={toggleShowPassword}
                  className="mx-3 duration-300 ease-in"
                  size="md"
                  type="button"
                  variant="secondary"
                >
                  {passwordIsShowing ? (
                    <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                  ) : (
                    <FontAwesomeIcon icon={faEyeSlash} className="h-4 w-4" />
                  )}
                </TextButton>
              )}
            />
            <div className="h-8"></div>
            <div className="flex w-full items-center gap-4">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handlers.close}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  removeWithdrawalPassword({
                    password: oldPassword,
                    reset_token: null,
                  });
                }}
                loading={isLoadingRemoveWithdrawalPassword}
              >
                Disable
              </Button>
            </div>
          </div>
        )}
      </div>
    </TitledModal>
  );
};
