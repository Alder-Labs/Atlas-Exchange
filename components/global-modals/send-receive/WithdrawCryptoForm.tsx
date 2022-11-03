import React, { FormEventHandler, useCallback, useMemo, useState } from 'react';

import { Rifm } from 'rifm';

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

const NUMBER_ACCEPTED = /[\d.]+/g;

export const WithdrawCryptoForm = (props: {
  coin: Coin;
  buttonText: string;
  onCancel?: () => void;
  onSuccess: (data: { data: WithdrawCryptoInput; coin: Coin }) => void;
}) => {
  const { coin, buttonText, onCancel, onSuccess } = props;

  const userState = useUserState();
  const hasWithdrawalLimits =
    userState.status === UserStateStatus.SIGNED_IN &&
    userState.loginStatusData.user?.kycLevel === 1;

  const { balancesMap, isLoading: balancesLoading } = useBalances();
  const { data: withdrawalLimits, isLoading: limitsLoading } =
    useWithdrawalLimits({ enabled: hasWithdrawalLimits });

  const getCoinBalance = useCallback(
    (coin: Coin): number => {
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
    },
    [balancesMap]
  );

  const balanceAvailable = useMemo(
    () => getCoinBalance(coin),
    [coin, getCoinBalance]
  );
  const [method, setMethod] = useState(coin.methods[0]);
  const [address, setAddress] = useState('');
  const [size, setSize] = useState('');
  const [tag, setTag] = useState('');
  const [saveAddress, setSaveAddress] = useState(false);
  const [saveAddressId, setSaveAddressId] = useState(null);

  const onSubmit: FormEventHandler<HTMLElement> = async (e) => {
    e.preventDefault();
    if (parseInt(size) > balanceAvailable) {
      toast.error('Amount greater than balance in wallet');
      return;
    }
    const data = {
      coin: coin.id,
      method,
      size,
      address,
    };
    onSuccess({ data, coin });
  };

  const withdrawalMethods = coin.methods.map((m) => {
    return { value: m, label: m.toUpperCase() };
  });

  return (
    <div>
      <form onSubmit={onSubmit} className="mb-4">
        <div className="flex flex-row">
          <div className="mr-6 ml-2 flex flex-col items-center">
            <CryptoIcon coinId={coin.id} className="mt-6 w-20"></CryptoIcon>
            <div className="h-2"></div>
            <Text>{coin.id}</Text>
          </div>
          <div className="w-full">
            <label>
              <Text>Network</Text>
            </label>
            <Select
              className="mb-4 block text-label font-medium text-textPrimary"
              value={method}
              onSelect={(value) => {
                if (!value) {
                  return;
                }
                setMethod(value);
              }}
              options={withdrawalMethods}
            />

            <Rifm
              accept={NUMBER_ACCEPTED}
              format={formatSize}
              value={size}
              onChange={(val) => {
                const stripped = val.replace(/[^\d.]/g, '');
                setSize(stripped);
              }}
            >
              {({ value, onChange }) => (
                <TextInput
                  className="w-full"
                  label="Amount"
                  placeholder="0.00000000"
                  onKeyDown={(e) => {
                    if (e.key === ',') {
                      e.preventDefault();
                    }
                  }}
                  value={value}
                  onChange={(e) => {
                    onChange(e);
                  }}
                />
              )}
            </Rifm>
            {balancesLoading && <Text>Balance: $---</Text>}
            {!balancesLoading && balancesMap && (
              <div
                className="cursor-pointer"
                onClick={() => setSize(getCoinBalance(coin).toString())}
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
          onChange={(e) => setAddress(e.target.value)}
        />
        {/* <div className="h-4"></div>
        <TextInput label="Tag" {...register('tag')}></TextInput> */}
        <div className="mt-4" />
        {withdrawalLimits && (
          <WithdrawalLimitPrompt withdrawalLimits={withdrawalLimits} />
        )}
        <Button
          type="submit"
          className="my-2 w-full"
          disabled={!size || !address || !method || limitsLoading}
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

function formatSize(nStr: string) {
  const x = nStr.replace(/[^\d.]/g, '').split('.');
  const x1 = x[0];
  const x2 = x.length > 1 ? '.' + x[1] : '';
  return `${x1}${x2}`;
}
