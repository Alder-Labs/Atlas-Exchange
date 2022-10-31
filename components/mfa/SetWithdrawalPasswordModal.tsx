import React, { useState } from 'react';

import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation } from 'react-query';

import { useModal } from '../../hooks/modal';
import { useUserState } from '../../lib/auth-token-context';
import { useDarkOrLightMode } from '../../lib/dark-mode';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { Button, Text, TextButton, TextInput } from '../base';
import { TitledModal } from '../modals/TitledModal';

// Blocked: need email enabled in order to be able to reset

interface SetWithdrawalPassword {
  password: string;
  newPassword: string;
}

export function SetWithdrawalPasswordModal() {
  const darkMode = useDarkOrLightMode();
  const userState = useUserState();
  const loginStatus = userState.loginStatusData;
  const hasPasswordSet = !!loginStatus?.user?.requireWithdrawalPassword;
  const [open, handlers] = useModal(false);

  const [password, setPassword] = useState('');
  const [passwordIsShowing, setPasswordIsShowing] = useState(false);
  const toggleShowPassword = () => {
    setPasswordIsShowing((prev) => !prev);
  };

  const { isLoading: isLoadingSetWithdrawalPassword } = useMutation(
    useMutationFetcher<SetWithdrawalPassword, {}>(
      `/proxy/api/wallet/withdrawal_password`,
      {
        onFetchSuccess: async (res) => {
          console.log(res);
        },
      }
    ),
    {
      onSuccess: (data) => {
        toast.success('Successfully set withdrawal password');
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  return (
    <>
      <Button
        className="w-48"
        onClick={handlers.open}
        disabled={true}
        variant={darkMode === 'dark' ? 'secondary' : 'outline'}
      >
        {hasPasswordSet ? 'Change or disable Password' : 'Set Password'}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                onClick={() => { }}
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
