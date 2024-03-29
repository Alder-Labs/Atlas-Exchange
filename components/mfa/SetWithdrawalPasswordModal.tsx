import React, { useState } from 'react';

import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation } from 'react-query';

import { useModal } from '../../hooks/modal';
import { useUserState } from '../../lib/auth-token-context';
import { useDarkOrLightMode } from '../../lib/dark-mode';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { UserStateStatus } from '../../lib/types/user-states';
import { Button, Text, TextButton, TextInput } from '../base';
import { TitledModal } from '../modals/TitledModal';

interface SetWithdrawalPassword {
  password: string;
  newPassword: string;
}

export function SetWithdrawalPasswordModal() {
  const darkMode = useDarkOrLightMode();
  const userState = useUserState();
  const loginStatus = userState.loginStatusData;
  const [open, handlers] = useModal(false);

  const [newPassword, setNewPassword] = useState('');
  const [passwordIsShowing, setPasswordIsShowing] = useState(false);
  const toggleShowPassword = () => {
    setPasswordIsShowing((prev) => !prev);
  };

  const {
    mutate: setWithdrawalPassword,
    isLoading: isLoadingSetWithdrawalPassword,
  } = useMutation(
    useMutationFetcher<SetWithdrawalPassword, {}>(
      `/proxy/api/wallet/withdrawal_password`
    ),
    {
      onSuccess: (data) => {
        toast.success('Successfully set withdrawal password');
        if (userState.status !== UserStateStatus.SIGNED_OUT) {
          userState.updateToken(userState.token).then(() => {
            handlers.close();
          });
        }
        setNewPassword('');
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  return (
    <>
      <Button
        className="w-56"
        onClick={handlers.open}
        variant={darkMode === 'dark' ? 'secondary' : 'outline'}
      >
        Set Password
      </Button>
      <TitledModal
        isOpen={open}
        title={'Set withdrawal password'}
        onClose={handlers.close}
      >
        <div>
          <div className="flex flex-col items-center p-6">
            <Text className="w-full text-left">
              Set a password that must be used for all withdrawals.
            </Text>
            <TextInput
              className="mt-4 w-full"
              type={passwordIsShowing ? 'text' : 'password'}
              label="Password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
                  setWithdrawalPassword({ newPassword, password: '' });
                }}
                loading={isLoadingSetWithdrawalPassword}
              >
                Enable
              </Button>
            </div>
          </div>
        </div>
      </TitledModal>
    </>
  );
}
