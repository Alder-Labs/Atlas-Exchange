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

interface SetWithdrawalPassword {
  password: string;
  newPassword: string;
}

export function UpdateWithdrawalPasswordModal() {
  const darkMode = useDarkOrLightMode();
  const [open, handlers] = useModal(false);

  return (
    <div>
      <Button
        className="w-56"
        onClick={handlers.open}
        variant={darkMode === 'dark' ? 'secondary' : 'outline'}
      >
        Update Password
      </Button>
      <UpdateWithdrawalPasswordModalInner isOpen={open} handlers={handlers} />
    </div>
  );
}

const UpdateWithdrawalPasswordModalInner = (props: {
  isOpen: boolean;
  handlers: UseModalCallbacks;
}) => {
  const { isOpen, handlers } = props;

  const userState = useUserState();
  const [showWarning, setShowWarning] = useState(true);

  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPasswordIsShowing, setNewPasswordIsShowing] = useState(false);
  const toggleShowNewPassword = () => {
    setNewPasswordIsShowing((prev) => !prev);
  };
  const [oldPasswordIsShowing, setOldPasswordIsShowing] = useState(false);
  const toggleShowOldPassword = () => {
    setOldPasswordIsShowing((prev) => !prev);
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
        toast.success('Successfully updated withdrawal password');
        if (userState.status !== UserStateStatus.SIGNED_OUT) {
          userState.updateToken(userState.token).then(() => {
            handlers.close();
          });
        }
        setOldPassword('');
        setNewPassword('');
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  return (
    <TitledModal
      isOpen={isOpen}
      title={'Update withdrawal password'}
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
              Set a password that must be used for all withdrawals.
            </Text>
            <TextInput
              className="mt-4 w-full"
              type={oldPasswordIsShowing ? 'text' : 'password'}
              label="Old Password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              renderSuffix={() => (
                <TextButton
                  onClick={toggleShowOldPassword}
                  className="mx-3 duration-300 ease-in"
                  size="md"
                  type="button"
                  variant="secondary"
                >
                  {oldPasswordIsShowing ? (
                    <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                  ) : (
                    <FontAwesomeIcon icon={faEyeSlash} className="h-4 w-4" />
                  )}
                </TextButton>
              )}
            />
            <TextInput
              className="mt-4 w-full"
              type={newPasswordIsShowing ? 'text' : 'password'}
              label="New Password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              renderSuffix={() => (
                <TextButton
                  onClick={toggleShowNewPassword}
                  className="mx-3 duration-300 ease-in"
                  size="md"
                  type="button"
                  variant="secondary"
                >
                  {newPasswordIsShowing ? (
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
                  setWithdrawalPassword({ newPassword, password: oldPassword });
                }}
                loading={isLoadingSetWithdrawalPassword}
              >
                Update
              </Button>
            </div>
          </div>
        )}
      </div>
    </TitledModal>
  );
};
