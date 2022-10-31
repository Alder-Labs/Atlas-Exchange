import React, { useState } from 'react';

import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { useWithdrawalLimits } from '../../../hooks/transfer';
import { useBalances } from '../../../hooks/wallet';
import { useUserState } from '../../../lib/auth-token-context';
import { renderCurrency } from '../../../lib/currency';
import { toast } from '../../../lib/toast';
import { Coin, WithdrawLimits } from '../../../lib/types';
import { UserStateStatus } from '../../../lib/types/user-states';
import { Button, Select, Text, TextInput } from '../../base';
import { CryptoIcon } from '../../CryptoIcon';
import { Warning } from '../../Warning';

import { WithdrawCryptoInput } from './WithdrawCryptoConfirm';

interface WithdrawCryptoFormInput {
  size: string;
  address: string;
  method: string;
  tag?: string;
  code?: string;
  password?: string;
  savedAddressId?: string;
}

const ERROR_ID = 'WithdrawCryptoForm';

export const WithdrawCryptoForm = (props: {
  coin: Coin;
  buttonText: string;
  onCancel?: () => void;
  onSuccess: (data: { data: WithdrawCryptoInput; coin: Coin }) => void;
}) => {
  const { coin, buttonText, onCancel, onSuccess } = props;

  const userState = useUserState();
  const requireWithdrawalLimits =
    userState.status === UserStateStatus.SIGNED_IN &&
    userState.loginStatusData.user?.kycLevel === 1;

  const { balancesMap, isLoading: balancesLoading } = useBalances();
  const { data: withdrawalLimits, isLoading: limitsLoading } =
    useWithdrawalLimits({ enabled: requireWithdrawalLimits });

  const {
    watch,
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<WithdrawCryptoFormInput>({
    defaultValues: {
      method: coin.methods[0],
      size: '',
      address: '',
    },
  });

  const getCoinBalance = (coin: Coin): number => {
    if (!balancesMap) {
      return 0.0;
    }
    if (coin.usdFungible && balancesMap['USD']) {
      return balancesMap['USD'].free;
    }
    if (balancesMap[coin.id]) {
      return balancesMap[coin.id].free;
    }
    return 0.0;
  };

  const balanceAvailable = getCoinBalance(coin);
  const [saveAddress, setSaveAddress] = useState(false);

  const onSubmit: SubmitHandler<WithdrawCryptoFormInput> = async (formData) => {
    const amount = Number(formData.size);
    if (amount > balanceAvailable) {
      toast.error('Amount greater than balance in wallet', { id: ERROR_ID });
      return;
    }

    if (formData.tag === '') {
      delete formData.tag;
    }
    if (formData.code === '') {
      delete formData.code;
    }
    if (formData.password === '') {
      delete formData.password;
    }
    if (!saveAddress || formData.savedAddressId === '') {
      delete formData.savedAddressId;
    }
    const data = {
      coin: coin.id,
      ...formData,
    };
    onSuccess({ data, coin });
  };

  const withdrawalMethods = coin.methods.map((m) => {
    return { value: m, label: m.toUpperCase() };
  });

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
        <div className="flex flex-row">
          <div className="mr-6 ml-2 flex flex-col items-center">
            <CryptoIcon coinId={coin.id} className="mt-6 w-20"></CryptoIcon>
            <div className="h-2"></div>
            <Text>{coin.id}</Text>
          </div>
          <div className="w-full">
            <Controller
              name={'method'}
              control={control}
              render={({ field }) => (
                <div>
                  <label>
                    <Text>Network</Text>
                  </label>
                  <Select
                    className="mb-4 block text-label font-medium text-textPrimary"
                    value={field.value ?? ''}
                    onSelect={(value) => {
                      if (typeof value === 'string') {
                        field.onChange(value);
                      }
                    }}
                    options={withdrawalMethods}
                  />
                </div>
              )}
            />
            <TextInput
              label="Amount"
              placeholder="0.0000000"
              {...register('size', { required: true })}
            />
            {balancesLoading && <Text>Balance: $---</Text>}
            {!balancesLoading && balancesMap && (
              <div
                className="cursor-pointer"
                onClick={() => {
                  setValue('size', getCoinBalance(coin).toString());
                }}
              >
                <Text color="info" className="hover:underline">
                  Balance: {getCoinBalance(coin).toString()} {coin.id}
                </Text>
              </div>
            )}
          </div>
        </div>
        <TextInput
          label="Address"
          {...register('address', {
            required: true,
          })}
        />
        {/* <div className="h-4"></div>
        <TextInput label="Tag" {...register('tag')}></TextInput> */}
        {/* <div className="h-4"></div>
        <TextInput label="Password" {...register('password')}></TextInput> */}
        {/*
        <InputCheckbox
          type="checkbox"
          label="Save address"
          checked={saveAddress}
          onChange={() => setSaveAddress(!saveAddress)}
        /> */}
        {saveAddress && (
          <TextInput
            label="Address Name"
            {...register('savedAddressId')}
          ></TextInput>
        )}
        <div className="mt-4" />
        {withdrawalLimits && (
          <WithdrawalLimitPrompt withdrawalLimits={withdrawalLimits} />
        )}
        <Button
          type="submit"
          className="my-2 w-full"
          disabled={
            !watch('size') ||
            !watch('address') ||
            !watch('method') ||
            limitsLoading
          }
        >
          {buttonText}
        </Button>
      </form>
      <Button variant="secondary" className="mt-2 w-full" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
};

const WithdrawalLimitPrompt = (props: { withdrawalLimits: WithdrawLimits }) => {
  const { withdrawalLimits } = props;

  if (withdrawalLimits.threshold && withdrawalLimits.exhausted) {
    return (
      <div>
        <Warning>
          <Text color="warning">
            Daily Limit Left:{' '}
            {renderCurrency({
              amount: withdrawalLimits.threshold - withdrawalLimits.exhausted,
              coinId: 'USD',
              showCoinId: false,
            })}
          </Text>
        </Warning>
        <div className="mt-4" />
      </div>
    );
  }

  return null;
};

export default WithdrawCryptoForm;
