import React, { useState } from 'react';

import {
  faCircleInfo,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation } from 'react-query';

import { useWithdrawalFees } from '../../../hooks/transfer';
import { useUserState } from '../../../lib/auth-token-context';
import { useMutationFetcher } from '../../../lib/mutation';
import { toast } from '../../../lib/toast';
import { Coin } from '../../../lib/types';
import { AddressText } from '../../AddressText';
import { Text, Button, TextInput, TextButton } from '../../base';
import { CryptoIcon } from '../../CryptoIcon';
import { ExistingMfaInput } from '../../mfa/ExistingMfaInput';
import { Warning } from '../../Warning';

export interface WithdrawCryptoInput {
  coin: string;
  size: string;
  address: string;
  method: string;
  tag?: string;
  password?: string;
  savedAddressId?: string;
}

export const WithdrawCryptoConfirm = (props: {
  coin: Coin;
  input: WithdrawCryptoInput;
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const { coin, input, onCancel, onSuccess } = props;
  const [mfaCode, setMfaCode] = useState('');
  const [withdrawalPasword, setWithdrawalPassword] = useState('');
  const [withdrawalPasswordIsShowing, setWithdrawalPasswordIsShowing] =
    useState(false);
  const toggleShowWithdrawalPassword = () => {
    setWithdrawalPasswordIsShowing((prev) => !prev);
  };

  const userState = useUserState();
  const loginStatus = userState.loginStatusData;
  const hasWithdrawalPasswordSet =
    !!loginStatus?.user?.requireWithdrawalPassword;

  const { data: withdrawalFee, isLoading: feeLoading } = useWithdrawalFees({
    coin: coin.id,
    address: input.address,
    method: input.method,
    size: Number(input.size),
  });

  const { isLoading: withdrawalLoading, mutate: withdrawCrypto } = useMutation(
    useMutationFetcher<WithdrawCryptoInput, {}>(
      '/proxy/api/wallet/withdrawals'
    ),
    {
      onSuccess: (data) => {
        toast.success('Successfully executed withdrawal');
        onSuccess();
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  const onSubmit = () => {
    const data = {
      code: mfaCode,
      password: withdrawalPasword,
      ...input,
    };
    withdrawCrypto(data);
  };

  return (
    <div>
      <div className="mt-4 flex flex-col">
        <div className="mx-4 flex flex-col">
          <div className="flex flex-col items-center">
            <CryptoIcon coinId={coin.id} className="w-20"></CryptoIcon>
            <div className="h-2"></div>
            <Text>{coin.name}</Text>
          </div>
          <div
            className="my-4
                flex flex-col justify-center rounded-xl
                border border-grayLight-80 dark:bg-grayDark-40"
          >
            <div className="flex flex-col px-6 py-4">
              <Entry
                left="To"
                right={
                  <AddressText className="ml-8">{input.address}</AddressText>
                }
              />
              <div className="h-px bg-grayLight-80 dark:bg-grayDark-60" />
              <Entry left="Amount" right={`${input.size} ${input.coin}`} />
              <div className="h-px bg-grayLight-80 dark:bg-grayDark-60" />
              <Entry left="Method" right={input.method.toUpperCase()} />
              <div className="h-px bg-grayLight-80 dark:bg-grayDark-60" />
              <Entry
                isLoading={feeLoading || !withdrawalFee}
                loadingWidth={128}
                left="Estimated network fee"
                right={`${
                  withdrawalFee?.fee
                } ${withdrawalFee?.method.toUpperCase()}`}
              />
              {withdrawalFee && withdrawalFee.congested && (
                <Warning>
                  <Text color="warning">
                    <div className="flex flex-row items-center">
                      <FontAwesomeIcon
                        icon={faCircleInfo}
                        className="mr-2.5 h-5"
                      />{' '}
                      Warning: Network is currently congested
                    </div>
                  </Text>
                </Warning>
              )}
            </div>
          </div>
          {hasWithdrawalPasswordSet && (
            <div>
              <div className="h-4"></div>
              <TextInput
                type={withdrawalPasswordIsShowing ? 'text' : 'password'}
                label="Withdrawal Password"
                placeholder="password"
                value={withdrawalPasword}
                onChange={(e) => {
                  // Digits only
                  setWithdrawalPassword(e.target.value);
                }}
                renderSuffix={() => (
                  <TextButton
                    onClick={toggleShowWithdrawalPassword}
                    className="mx-3 duration-300 ease-in"
                    size="md"
                    type="button"
                    variant="secondary"
                  >
                    {withdrawalPasswordIsShowing ? (
                      <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                    ) : (
                      <FontAwesomeIcon icon={faEyeSlash} className="h-4 w-4" />
                    )}
                  </TextButton>
                )}
              ></TextInput>
            </div>
          )}
          <div className="h-4" />
          <ExistingMfaInput
            required={true}
            label="MFA Code *"
            placeholder="MFA Code"
            value={mfaCode}
            onChange={setMfaCode}
          ></ExistingMfaInput>
          <div className="h-6" />
        </div>
        <div className="w-full">
          <Button
            type="submit"
            className="w-full"
            onClick={onSubmit}
            disabled={mfaCode.length === 0 || feeLoading || withdrawalLoading}
          >
            Submit
          </Button>
          <div className="h-4" />
          <Button
            variant="secondary"
            className="w-full"
            disabled={withdrawalLoading}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawCryptoConfirm;

const Entry = (props: {
  left: React.ReactNode;
  right: React.ReactNode;
  isLoading?: boolean;
  loadingWidth?: string | number;
}) => {
  const { left, right, isLoading = false, loadingWidth } = props;
  return (
    <div className="border-b-1 flex flex-row justify-between border-grayLight-80 py-4">
      <div>
        <Text>{left}</Text>
      </div>
      <div className="flex flex-row">
        <Text
          isLoading={isLoading}
          loadingWidth={loadingWidth}
          color="secondary"
          className="text-right"
        >
          {right}
        </Text>
      </div>
    </div>
  );
};
