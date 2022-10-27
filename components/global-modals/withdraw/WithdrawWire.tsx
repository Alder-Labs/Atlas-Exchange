import React, { useState } from 'react';

import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { useBalances } from '../../../hooks/useBalances';
import { useLoginStatus } from '../../../hooks/useLoginStatus';
import { useUserState } from '../../../lib/auth-token-context';
import {
  countryCodesAlpha3,
  countryRegionsAlpha3,
} from '../../../lib/country-codes';
import { renderCurrency } from '../../../lib/currency';
import { useMutationFetcher } from '../../../lib/mutation';
import { toast } from '../../../lib/toast';
import { UserStateStatus } from '../../../lib/types/user-states';
import { Button, Select, Text, TextInput } from '../../base';
import { CURRENCY_OPTIONS } from '../../global-modals/deposit/Wire';
import { ExistingMfaInput } from '../../mfa/ExistingMfaInput';

interface WithdrawWireData {
  coin: string;
  size: string;
  code: string;
  address: {
    'funds-transfer-type': string;
    'bank-account-number': string;
    'routing-number': string;
    'beneficiary-address': {
      'bank-account-name': string;
      'street-1': string;
      'street-2'?: string;
      city: string;
      country: string;
      region: string; // state
      'postal-code'?: string;
    };
    reference?: string;
  };
  saveAddress?: boolean;
  addressName?: string;
}

interface WithdrawWireInput {
  size: string;
  address: {
    'funds-transfer-type': string;
    'bank-account-number': string;
    'routing-number': string;
    'beneficiary-address': {
      'bank-account-name': string;
      'street-1': string;
      'street-2'?: string;
      city: string;
      country: string;
      region: string; // state
      'postal-code'?: string;
    };
    reference?: string;
  };
  saveAddress?: boolean;
  addressName?: string;
}

export const WithdrawWire = ({ onSuccess }: { onSuccess: () => void }) => {
  const userState = useUserState();
  const isLoggedIn = userState.status === UserStateStatus.SIGNED_IN;

  const { register, handleSubmit, setValue, getValues, formState, control } =
    useForm<WithdrawWireInput>({
      defaultValues: {
        address: {
          'funds-transfer-type': 'wire',
        },
      },
    });

  const { data: loginStatus } = useLoginStatus();
  const { balancesMap, isLoading: loadingBalances } = useBalances();

  const [countryRegions, setCountryRegions] = useState<
    { value: string; label: string }[]
  >([]);
  const [coinId, setCoinId] = useState('USD');
  const [mfaCode, setMfaCode] = useState('');

  const [saveAddress, setSaveAddress] = useState(false);

  const { isLoading: withdrawalLoading, mutate: withdrawWire } = useMutation(
    useMutationFetcher<WithdrawWireData, {}>(
      '/proxy/api/wallet/fiat_withdrawals'
    ),
    {
      onSuccess: (data) => {
        onSuccess();
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  const onSubmit: SubmitHandler<WithdrawWireInput> = async (formData) => {
    if (formData.address['beneficiary-address']['postal-code'] === '') {
      delete formData.address['beneficiary-address']['postal-code'];
    }
    if (formData.address.reference === '') {
      delete formData.address.reference;
    }
    if (formData.saveAddress === false) {
      delete formData.saveAddress;
      delete formData.addressName;
    }
    const data = {
      coin: coinId,
      code: mfaCode,
      ...formData,
    };
    withdrawWire(data);
  };

  const onChangeCoinId = (s: string) => {
    setCoinId(s);
    if (s === 'USD') {
      setValue('address.funds-transfer-type', 'wire');
    } else {
      setValue('address.funds-transfer-type', 'wire_international');
    }
  };

  const fundsTransferTypeOptions = [
    { value: 'wire', label: 'US Domestic Wire' },
    { value: 'wire_international', label: 'International Wire' },
  ];

  const fundsTransferTypeOptionsInternational = [
    { value: 'wire_international', label: 'International Wire' },
  ];

  return (
    <div>
      <div className="rounded-md bg-warning/30 py-2 px-4">
        <Text>
          Please double-check before sending that your bank will be able to
          facilitate this transfer.
        </Text>
      </div>
      <div className="h-2"></div>
      <div className="rounded-md bg-warning/30 py-2 px-4">
        <Text>
          Please make sure to enter your ABA/routing number for wires, and not
          for ACH!
        </Text>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="h-8"></div>

        <Text size="xl" weight="bold">
          Wire Information
        </Text>
        <div className="h-2"></div>
        <div className="flex flex-row items-end">
          <div>
            <label>
              <Text color="secondary" weight="medium">
                Currency *
              </Text>
              <div className="h-2" />
            </label>
            <Select
              className="mr-2 w-48"
              value={coinId}
              onSelect={(e) => {
                if (typeof e === 'string') {
                  onChangeCoinId(e);
                }
              }}
              options={CURRENCY_OPTIONS}
            />
          </div>
          <TextInput
            label={`Amount *`}
            placeholder="0.00"
            {...register('size', {
              required: 'Please provide the withdrawal amount',
            })}
          ></TextInput>
        </div>
        <div className="h-1" />
        <Text
          color="secondary"
          size="sm"
          isLoading={loadingBalances}
          loadingWidth="4rem"
        >
          Balance:{' '}
          {renderCurrency({
            amount: balancesMap?.[coinId]?.total ?? 0,
            coinId: coinId,
          })}
        </Text>
        <div className="h-4" />
        <Controller
          name={'address.funds-transfer-type'}
          control={control}
          rules={{ required: 'Please provide the address to withdraw to' }}
          render={({ field }) => (
            <div>
              <label>
                <Text color="secondary" weight="medium">
                  Type *
                </Text>
              </label>
              <div className="h-2" />
              <Select
                value={field.value}
                onSelect={(e) => {
                  if (typeof e === 'string') {
                    field.onChange(e);
                  }
                }}
                options={
                  coinId === 'USD'
                    ? fundsTransferTypeOptions
                    : fundsTransferTypeOptionsInternational
                }
              />
            </div>
          )}
        />

        <div className="h-8"></div>
        <Text size="xl" weight="bold">
          Bank Information
        </Text>
        <div className="h-2"></div>
        <TextInput
          label="Account number *"
          placeholder="Account number (IBAN if needed)"
          required
          {...register('address.bank-account-number')}
        ></TextInput>
        <div className="h-4" />
        <TextInput
          label="Routing number *"
          required
          {...register('address.routing-number')}
        ></TextInput>

        <div className="h-8"></div>
        <Text size="xl" weight="bold">
          Beneficiary Information
        </Text>
        <div className="h-2"></div>

        <TextInput
          label="Beneficiary name *"
          required
          {...register('address.beneficiary-address.bank-account-name')}
        ></TextInput>

        <div className="h-4" />
        <TextInput
          label="Street address line 1 *"
          required
          {...register('address.beneficiary-address.street-1')}
        ></TextInput>

        <div className="h-4" />
        <TextInput
          label="Street address line 2"
          {...register('address.beneficiary-address.street-2')}
        ></TextInput>

        <div className="h-4" />
        <TextInput
          label="City *"
          required
          {...register('address.beneficiary-address.city')}
        ></TextInput>

        <div className="h-4" />
        <Controller
          name={'address.beneficiary-address.country'}
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <div>
              <label>
                <Text color="secondary" weight="medium">
                  Country *
                </Text>
              </label>
              <div className="h-2" />
              <Select
                value={field.value}
                onSelect={(e) => {
                  if (typeof e === 'string') {
                    field.onChange(e);
                    if (countryRegionsAlpha3[e]) {
                      setCountryRegions(countryRegionsAlpha3[e]);
                    } else {
                      setCountryRegions([]);
                    }
                  }
                }}
                options={countryCodesAlpha3}
                className="w-full"
              />
            </div>
          )}
        />
        <div className="h-4" />
        <Controller
          name={'address.beneficiary-address.region'}
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <div>
              <label>
                <Text color="secondary" weight="medium">
                  State, Province, Region
                </Text>
              </label>
              <div className="h-2" />
              <Select
                value={field.value}
                onSelect={(e) => {
                  if (typeof e === 'string') {
                    field.onChange(e);
                  }
                }}
                options={countryRegions}
                className="w-full"
              />
            </div>
          )}
        />

        <div className="h-4" />
        <TextInput
          label="Postal code"
          placeholder="Postal code (leave blank if not applicable)"
          {...register('address.beneficiary-address.postal-code')}
        ></TextInput>

        <div className="h-4" />
        <TextInput
          label="Reference"
          placeholder="Reference (leave blank if not applicable)"
          {...register('address.reference')}
        ></TextInput>

        <div className="h-4" />
        {/* <InputCheckbox
          type="checkbox"
          label="Save wire info"
          checked={saveAddress}
          onChange={() => setSaveAddress((prev) => !prev)}
        />
        {saveAddress && (
          <TextInput
            label="Wire info name"
            placeholder="Wire info name"
            {...register('addressName')}
          ></TextInput>
        )} */}

        <div className="h-8" />
        {loginStatus?.user?.requireMfaForWithdrawals && (
          <ExistingMfaInput
            label="MFA Code *"
            placeholder="MFA Code"
            value={mfaCode}
            onChange={setMfaCode}
          ></ExistingMfaInput>
        )}

        <div className="h-8" />
        <Button type="submit" className="w-full" loading={withdrawalLoading}>
          Withdraw
        </Button>
      </form>
    </div>
  );
};

export default WithdrawWire;
