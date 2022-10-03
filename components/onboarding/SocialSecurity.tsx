import { useEffect } from 'react';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { Rifm } from 'rifm';

import { KycSsn } from '../../lib/types/kyc';
import { Text, TextInput, Button } from '../base';

import { OnboardingCard, OnboardingCardProps } from './OnboardingCard';

function formatSSN(value: string) {
  if (!value) return value;

  const ssn = value.replace(/\D/g, '');
  const ssnLength = ssn.length;

  if (ssnLength < 4) return ssn;

  if (ssnLength < 6) {
    return `${ssn.slice(0, 3)}-${ssn.slice(3)}`;
  }

  return `${ssn.slice(0, 3)}-${ssn.slice(3, 5)}-${ssn.slice(5, 9)}`;
}

interface SocialSecurityProps
  extends Omit<OnboardingCardProps, 'children' | 'title'> {
  onContinue: () => void;
}

export function SocialSecurity(props: SocialSecurityProps) {
  const { onContinue, ...rest } = props;

  const cachedForm = JSON.parse(localStorage.getItem('kycForm') || '{}');

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<KycSsn>({
    defaultValues: cachedForm,
  });

  // Append Phone Data to KYC Form Data
  const onSubmit = (data: KycSsn) => {
    const prevRawKycFormData: string = localStorage.getItem('kycForm') || '{}';

    localStorage.setItem(
      'kycForm',
      JSON.stringify({
        ...JSON.parse(prevRawKycFormData),
        socialSecurityNumber: data.socialSecurityNumber,
      })
    );

    onContinue();
  };

  const vals = useWatch({
    control: control,
    name: ['socialSecurityNumber'],
  });
  useEffect(() => {
    const [socialSecurityNumber] = vals;
    const prevRawKycFormData: string = localStorage.getItem('kycForm') || '{}';
    localStorage.setItem(
      'kycForm',
      JSON.stringify({
        ...JSON.parse(prevRawKycFormData),
        socialSecurityNumber,
      })
    );
  }, [vals]);

  return (
    <OnboardingCard {...rest} title={'Social Security Number'}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-md">
          <div className="h-2"></div>
          <Text color={'secondary'}>
            By providing your social security number, you will be able to unlock
            trading features
          </Text>
        </div>

        <div className="h-6"></div>
        <Controller
          name={'socialSecurityNumber'}
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Rifm
              accept={/\d+/g}
              format={formatSSN}
              value={field.value ?? ''}
              onChange={(val) => {
                const strippedVal = val.replace(/\D/g, '');
                field.onChange(strippedVal);
              }}
            >
              {({ value, onChange }) => (
                <TextInput
                  placeholder={'000-00-0000'}
                  value={value}
                  onChange={onChange}
                  className="w-full"
                />
              )}
            </Rifm>
          )}
        />
        {errors.socialSecurityNumber?.type === 'required' && (
          <Text color={'error'} size="sm">
            required
          </Text>
        )}
        <div className="h-8"></div>
        <Button className="w-full" type="submit">
          Continue
        </Button>
      </form>
    </OnboardingCard>
  );
}
