import { useEffect, useMemo } from 'react';

import { Controller, useForm, useWatch } from 'react-hook-form';

import {
  countryCodesAlpha3,
  countryRegionsAlpha3,
} from '../../lib/country-codes';
import { LocalStorageKey } from '../../lib/local-storage-keys';
import { KycAddress } from '../../lib/types/kyc';
import { Text, TextInput, Button, Select } from '../base';
import { SelectAutocomplete } from '../base/SelectAutocomplete';

import { OnboardingCard, OnboardingCardProps } from './OnboardingCard';

interface AddressInformationProps
  extends Omit<OnboardingCardProps, 'children' | 'title'> {
  onContinue: () => void;
}

export function AddressInformation(props: AddressInformationProps) {
  const { onContinue, ...rest } = props;

  const cachedForm = JSON.parse(
    localStorage.getItem(LocalStorageKey.KycForm) || '{}'
  );
  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<KycAddress>({ defaultValues: cachedForm });

  // Append Phone to KYC Form Data
  const onSubmit = (data: KycAddress) => {
    const prevRawKycFormData: string =
      localStorage.getItem(LocalStorageKey.KycForm) || '{}';

    localStorage.setItem(
      LocalStorageKey.KycForm,
      JSON.stringify({
        ...JSON.parse(prevRawKycFormData),
        country: data.country,
        stateProvinceRegion: data.stateProvinceRegion,
        streetAddress: data.streetAddress,
        city: data.city,
        postalCode: data.postalCode,
      })
    );

    onContinue();
  };

  const vals = useWatch({
    control: control,
    name: [
      'country',
      'stateProvinceRegion',
      'streetAddress',
      'city',
      'postalCode',
    ],
  });
  useEffect(() => {
    const [country, stateProvinceRegion, streetAddress, city, postalCode] =
      vals;
    const prevRawKycFormData: string =
      localStorage.getItem(LocalStorageKey.KycForm) || '{}';
    localStorage.setItem(
      LocalStorageKey.KycForm,
      JSON.stringify({
        ...JSON.parse(prevRawKycFormData),
        country,
        stateProvinceRegion,
        streetAddress,
        city,
        postalCode,
      })
    );
  }, [vals]);

  const countryCodesList = useMemo(() => {
    // Put united states at the top of the list

    const otherCountries = countryCodesAlpha3.filter(
      (country) => country.value !== 'USA'
    );
    return [
      { label: 'United States of America', value: 'USA' },
      ...otherCountries,
    ];
  }, []);

  const countryRegions = watch('country')
    ? countryRegionsAlpha3[watch('country')] ?? []
    : [];

  return (
    <OnboardingCard {...rest} title={'Address Information'}>
      <div className="h-6"></div>
      <form onSubmit={handleSubmit(onSubmit)}>
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
              value={field.value}
              onSelect={(e) => {
                if (typeof e === 'string') {
                  field.onChange(e);
                  setValue('stateProvinceRegion', '');
                }
              }}
              options={countryCodesList}
              className="w-full"
              placeholder={'Select a country'}
            />
          )}
        />
        {errors.country?.type === 'required' && (
          <Text color="error" size="sm">
            {'required'}
          </Text>
        )}
        <div className="h-6"></div>

        <TextInput
          label={'Street Address'}
          placeholder={'Street Address'}
          className="w-full"
          {...register('streetAddress', { required: true })}
        />
        {errors.streetAddress?.type === 'required' && (
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
              name={'stateProvinceRegion'}
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-black dark:text-grayDark-80">
                    State, Province, Region
                  </label>
                  <div className="h-2" />
                  <SelectAutocomplete
                    value={field.value}
                    onSelect={(e) => {
                      if (typeof e === 'string') {
                        field.onChange(e);
                      }
                    }}
                    options={countryRegions}
                    className="w-full"
                    placeholder={'Select an option'}
                  />
                </div>
              )}
            />
            {errors.stateProvinceRegion?.type === 'required' && (
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
        <Button className="w-full" type="submit">
          Continue
        </Button>
      </form>
    </OnboardingCard>
  );
}
