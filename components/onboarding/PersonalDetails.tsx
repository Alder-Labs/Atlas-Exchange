import { useEffect } from 'react';

import { Controller, useForm, useWatch } from 'react-hook-form';

import { KycPersonForm } from '../../lib/types/kyc';
import { Text, TextInput, Button, TextLabel } from '../base';
import { SelectAutocomplete } from '../base/SelectAutocomplete';

import { OnboardingCardProps, OnboardingCard } from './OnboardingCard';

interface PersonalDetailsProps
  extends Omit<OnboardingCardProps, 'children' | 'title'> {
  onContinue: () => void;
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const monthOptions = MONTHS.map((month, i) => ({
  value: (i + 1).toString(),
  label: month,
}));
const dayOptions = Array.from(Array(31).keys()).map((i) => ({
  value: (i + 1).toString(),
  label: (i + 1).toString(),
}));

const yearOfToday = new Date().getFullYear();
const yearOptions = Array.from(Array(150).keys()).map((i) => ({
  value: (yearOfToday - i).toString(),
  label: (yearOfToday - i).toString(),
}));

export function PersonalDetails(props: PersonalDetailsProps) {
  const { onContinue } = props;

  const cachedForm = JSON.parse(localStorage.getItem('kycForm') || '{}');
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KycPersonForm>({ defaultValues: cachedForm });

  // Store person data locally for future submission
  const onSubmit = (data: KycPersonForm) => {
    const prevRawKycFormData: string = localStorage.getItem('kycForm') || '{}';

    localStorage.setItem(
      'kycForm',
      JSON.stringify({
        ...JSON.parse(prevRawKycFormData),
        fullLegalName: data.fullLegalName,
        day: data.day,
        month: data.month,
        year: data.year,
      })
    );
    onContinue();
  };

  const vals = useWatch({
    control: control,
    name: ['fullLegalName', 'day', 'month', 'year'],
  });
  useEffect(() => {
    const [fullLegalName, day, month, year] = vals;
    const prevRawKycFormData: string = localStorage.getItem('kycForm') || '{}';
    localStorage.setItem(
      'kycForm',
      JSON.stringify({
        ...JSON.parse(prevRawKycFormData),
        fullLegalName,
        day,
        month,
        year,
      })
    );
  }, [vals]);

  return (
    <OnboardingCard {...props} title="Your Personal Details" center={false}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="max-w-md">
          <div className="h-2"></div>
          <Text color={'secondary'}>
            Please enter information according to your official government
            documents.
          </Text>
        </div>
        <div className="h-8"></div>
        <TextInput
          label={'Full Legal Name'}
          placeholder={'Full Legal Name'}
          {...register('fullLegalName', { required: true })}
        />
        {errors.fullLegalName?.type === 'required' && (
          <Text color={'error'} size="sm">
            Full Legal Name is required
          </Text>
        )}

        <div className={'h-4'} />

        <div className="grid grid-cols-3 sm:grid-cols-4">
          <div>
            <TextLabel>Month</TextLabel>
            <div className={'h-2'} />
            <Controller
              name={'month'}
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <SelectAutocomplete
                  value={field.value}
                  placeholder="Month"
                  onSelect={(value) => field.onChange(value)}
                  options={monthOptions}
                />
              )}
            />
            {errors.month?.type === 'required' && (
              <Text color={'error'} size="sm">
                required
              </Text>
            )}
          </div>

          <div className="ml-4">
            <TextLabel>Day</TextLabel>
            <div className={'h-2'} />
            <Controller
              name={'day'}
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <SelectAutocomplete
                  value={field.value}
                  placeholder="Day"
                  onSelect={(value) => field.onChange(value)}
                  options={dayOptions}
                />
              )}
            />
            {errors.day?.type === 'required' && (
              <Text color={'error'} size="sm">
                required
              </Text>
            )}
          </div>

          <div className="ml-4">
            <label className="block text-sm font-medium text-black dark:text-grayDark-80">
              Year
            </label>
            <div className={'h-2'} />
            <Controller
              name={'year'}
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <SelectAutocomplete
                  value={field.value}
                  placeholder="Year"
                  onSelect={(value) => field.onChange(value)}
                  options={yearOptions}
                />
              )}
            />
            {errors.year?.type === 'required' && (
              <Text color={'error'} size="sm">
                required
              </Text>
            )}
          </div>
        </div>

        <div className="h-8" />
        <Button className="w-full" type="submit">
          Continue
        </Button>
      </form>
    </OnboardingCard>
  );
}
