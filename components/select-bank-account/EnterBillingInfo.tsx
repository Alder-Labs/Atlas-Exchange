import { useMemo } from 'react';

import { Controller, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { BankAccount, useBankAccounts } from '../../hooks/transfer';
import {
  countryCodesAlpha3,
  countryRegionsAlpha3,
} from '../../lib/country-codes';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { Text, Button, TextInput } from '../base';
import { SelectAutocomplete } from '../base/SelectAutocomplete';
export type BillingInfo = {
  name: string;
  line1: string;
  city: string;
  district: string;
  postalCode: string;
  country: string;
};
interface EnterBillingInfoProps {
  account: BankAccount;
  onSuccess?: () => void;
}
export function EnterBillingInfo(props: EnterBillingInfoProps) {
  const { account, onSuccess } = props;

  const { refetch } = useBankAccounts();

  const { mutateAsync, isLoading } = useMutation(
    useMutationFetcher<BillingInfo, any>(
      `/proxy/api/ach/accounts/${account.id}/billing_info`,
      {
        onFetchSuccess: refetch,
      }
    ),
    {
      onSuccess: () => {
        toast.success('Billing info updated.');
      },
    }
  );

  // Append Phone to KYC Form Data
  const onSubmit = (data: BillingInfo) => {
    mutateAsync(data)
      .then(() => {
        onSuccess?.();
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<BillingInfo>({});

  const country = watch('country');
  const countryRegions = useMemo(
    () => (country ? countryRegionsAlpha3[country] ?? [] : []),
    [country]
  );

  return (
    <div className="">
      <Text color="secondary">
        Please enter your billing information associated with the following
        account in order to verify and use it.
      </Text>
      <div className="h-4"></div>
      <Text weight="bold">{account.data?.institutionName}</Text>
      <div></div>
      <Text size="sm">
        {account.name} | {account.data?.mask}
      </Text>

      <div className="h-8"></div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          label={'Full Name'}
          placeholder={'Your full name'}
          className="w-full"
          {...register('name', { required: true })}
        />
        {errors.name?.type === 'required' && (
          <Text color="error" size="sm">
            {'required'}
          </Text>
        )}
        <div className="h-4"></div>

        <label className="block text-sm font-medium text-black dark:text-grayDark-80">
          Country
        </label>
        <div className="h-1"></div>
        <Controller
          name={'country'}
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <SelectAutocomplete
              placeholder="Select..."
              value={field.value}
              onSelect={(e) => {
                if (typeof e === 'string') {
                  field.onChange(e);
                  setValue('district', '');
                }
              }}
              options={countryCodesAlpha3}
              className="w-full"
            />
          )}
        />
        {errors.country?.type === 'required' && (
          <Text color="error" size="sm">
            {'required'}
          </Text>
        )}
        <div className="h-4"></div>

        <TextInput
          label={'Street Address'}
          placeholder={'Street Address'}
          className="w-full"
          {...register('line1', { required: true })}
        />
        {errors.line1?.type === 'required' && (
          <Text color="error" size="sm">
            {'required'}
          </Text>
        )}

        <div className="h-4"></div>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <TextInput
              label={'City'}
              placeholder={'City'}
              {...register('city', { required: true })}
            />
            {errors.city?.type === 'required' && (
              <Text color="error" size="sm">
                {'required'}
              </Text>
            )}
          </div>
          <div className="col-span-2">
            <Controller
              name={'district'}
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-black dark:text-grayDark-80">
                    State, Province, Region
                  </label>
                  <div className="h-2" />
                  <SelectAutocomplete
                    placeholder="Select..."
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
            {errors.district?.type === 'required' && (
              <Text color="error" size="sm">
                {'required'}
              </Text>
            )}
          </div>
          <div className="col-span-2">
            <TextInput
              label={'Postal Code'}
              placeholder={'00000'}
              {...register('postalCode', { required: true })}
            />
            {errors.postalCode?.type === 'required' && (
              <Text color="error" size="sm">
                {'required'}
              </Text>
            )}
          </div>
        </div>
        <div className="h-4" />

        <div className={'h-8'} />
        <Button className="w-full" type="submit" loading={isLoading}>
          Submit
        </Button>
      </form>
    </div>
  );
}
