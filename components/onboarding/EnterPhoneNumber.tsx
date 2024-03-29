import { useEffect, useState } from 'react';

import { iso31661Alpha3ToAlpha2 } from 'iso-3166';
import { AsYouType } from 'libphonenumber-js';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useMutation } from 'react-query';
import { Rifm } from 'rifm';

import { useCurrentDate } from '../../hooks/utils';
import {
  countryPhoneNumberCodes,
  ALPHA2_TO_PHONE_CODES,
} from '../../lib/country-phone-number';
import { requireEnvVar } from '../../lib/env';
import { LocalStorageKey } from '../../lib/local-storage-keys';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { KycPhone } from '../../lib/types/kyc';
import { RecaptchaActions, RecaptchaParams } from '../../lib/types/recaptcha';
import { Text, TextInput, Button, Select } from '../base';

import { OnboardingCardProps, OnboardingCard } from './OnboardingCard';

const RECAPTCHA_KEY = requireEnvVar('NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY');

const parseDigits = (string: string) => (string?.match(/\d+/g) || []).join('');

const formatPhone = (string: string) => {
  const digits = parseDigits(string).slice(0, 10);
  return new AsYouType('US').input(digits);
};

type RequestPhoneVerification = {
  phoneNumber: string;
} & RecaptchaParams;

interface EnterPhoneNumberProps
  extends Omit<OnboardingCardProps, 'children' | 'title'> {
  onFinish: () => Promise<void>;
}

function setDefaultSmsCountryToAddressCountry() {
  const cachedForm = JSON.parse(
    localStorage.getItem(LocalStorageKey.KycForm) || '{}'
  );
  const countryPhoneCode =
    ALPHA2_TO_PHONE_CODES[iso31661Alpha3ToAlpha2[cachedForm.country]];
  // set country code phone number to the country user has selected
  cachedForm.countryCode = countryPhoneCode;
  // update localstorage with changes
  localStorage.setItem(
    LocalStorageKey.KycForm,
    JSON.stringify({
      ...cachedForm,
    })
  );
}

function EnterPhoneNumberInside(props: EnterPhoneNumberProps) {
  const { onFinish, ...rest } = props;

  setDefaultSmsCountryToAddressCountry();
  const cachedForm = JSON.parse(
    localStorage.getItem(LocalStorageKey.KycForm) || '{}'
  );

  const {
    setValue,
    register,
    clearErrors,
    setError,
    getValues,
    handleSubmit,
    control,
    formState,
  } = useForm<KycPhone>({
    defaultValues: cachedForm,
  });
  const { errors } = formState;

  // Append Phone Data to KYC Form Data
  const [loading, setLoading] = useState(false);
  const onSubmit = (data: KycPhone) => {
    setLoading(true);
    const prevRawKycFormData: string =
      localStorage.getItem(LocalStorageKey.KycForm) || '{}';

    localStorage.setItem(
      LocalStorageKey.KycForm,
      JSON.stringify({
        ...JSON.parse(prevRawKycFormData),
        phoneNumber: data.phoneNumber,
        countryCode: data.countryCode,
        smsCode: data.smsCode,
      })
    );

    onFinish().finally(() => {
      setLoading(false);
    });
  };

  const vals = useWatch({
    control: control,
    name: ['phoneNumber', 'countryCode', 'smsCode'],
  });
  useEffect(() => {
    const [phoneNumber, countryCode, smsCode] = vals;
    const prevRawKycFormData: string =
      localStorage.getItem(LocalStorageKey.KycForm) || '{}';
    localStorage.setItem(
      LocalStorageKey.KycForm,
      JSON.stringify({
        ...JSON.parse(prevRawKycFormData),
        phoneNumber,
        countryCode,
        smsCode,
      })
    );
  }, [vals]);

  // Phone Number Verification Code Timer
  const currentDate = useCurrentDate();
  const [codeLastSent, setCodeLastSent] = useState<Date | null>(null);
  const secondsRemaining = Math.max(
    0,
    codeLastSent
      ? 59 - Math.floor((currentDate.getTime() - codeLastSent.getTime()) / 1000)
      : 0
  );

  const phoneNum = useWatch({ control: control, name: 'phoneNumber' });
  useEffect(() => {
    setCodeLastSent(null);
  }, [phoneNum]);

  const {
    isLoading: requestPhoneVerificationLoading,
    mutate: requestPhoneVerification,
  } = useMutation(
    useMutationFetcher<RequestPhoneVerification, {}>(
      `/proxy/api/mfa/sms/setup`
    ),
    {
      onSuccess: (data) => {
        setCodeLastSent(new Date());
        toast.success('Successfully requested phone verification');
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  const { executeRecaptcha } = useGoogleReCaptcha();

  // Request SMS verification code is sent to phone
  const onRequestSmsCode = async () => {
    const { countryCode, phoneNumber } = getValues();
    clearErrors('phoneNumber');
    if (!phoneNumber) {
      setError('phoneNumber', { type: 'required' }, { shouldFocus: true });
      return;
    }
    if (!countryCode) {
      setError('countryCode', { type: 'required' }, { shouldFocus: true });
      return;
    }

    let inputData = {
      phoneNumber: `+${countryCode}${phoneNumber}`,
      captcha: {
        recaptcha_challenge: '',
      },
    };
    if (!executeRecaptcha) {
      toast.error('Error: reCAPTCHA not loaded.');
      return;
    }

    try {
      const captchaToken = await executeRecaptcha(RecaptchaActions.SMS);
      inputData.captcha.recaptcha_challenge = captchaToken;
    } catch (e) {
      toast.error('Error: reCAPTCHA failed. Please contact Support.');
      return;
    }
    requestPhoneVerification(inputData);
  };

  return (
    <OnboardingCard {...rest} title="Phone Number">
      <div className="h-6"></div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="block text-sm font-medium text-black dark:text-grayDark-80">
          Phone Number
        </label>
        <div className="h-1"></div>

        <div className="grid grid-cols-4 items-start gap-4">
          <div>
            <Controller
              name={'countryCode'}
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onSelect={(value) => {
                    if (!value) {
                      return;
                    }
                    field.onChange(value);
                  }}
                  options={countryPhoneNumberCodes}
                  className="col-span-1 w-full items-center"
                  placeholder="none"
                />
              )}
            />
            {errors.countryCode?.type === 'required' && (
              <Text color="error" size="sm">
                {'required'}
              </Text>
            )}
          </div>
          <div className={'col-span-3 flex flex-row'}>
            <div className="w-full">
              <Controller
                name={'phoneNumber'}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Rifm
                    accept={/\d+/g}
                    // do not jump after ) until see number before
                    mask={
                      !field.value ||
                      (field?.value?.length < 6 &&
                        /[^\d]+/.test(field.value[3]))
                        ? undefined
                        : field.value.length >= 14
                    }
                    format={formatPhone}
                    value={field.value}
                    onChange={(val) => {
                      const strippedVal = val.replace(/\D/g, '');
                      field.onChange(strippedVal);
                    }}
                  >
                    {({ value, onChange }) => (
                      <TextInput
                        placeholder={'Phone Number'}
                        value={value}
                        onChange={onChange}
                        className="w-full"
                        renderSuffix={() => (
                          <div>
                            <Button
                              size="sm"
                              rounded="md"
                              onClick={onRequestSmsCode}
                              loading={requestPhoneVerificationLoading}
                              type="button"
                              className="mx-2 whitespace-nowrap"
                              disabled={secondsRemaining > 0}
                            >
                              {requestPhoneVerificationLoading
                                ? 'Sending...'
                                : secondsRemaining
                                ? `Resend (${secondsRemaining})`
                                : `Send SMS`}
                            </Button>
                          </div>
                        )}
                      />
                    )}
                  </Rifm>
                )}
              />

              {errors.phoneNumber?.type === 'required' && (
                <Text color="error" size="sm">
                  {'required'}
                </Text>
              )}
            </div>
          </div>
        </div>
        <div className="h-6"></div>
        <TextInput
          label={'SMS Verification Code'}
          placeholder={'SMS Verification Code'}
          {...register('smsCode', { required: true })}
        />
        {errors.smsCode?.type === 'required' && (
          <Text color={'error'} size="sm">
            required
          </Text>
        )}

        <div className="h-8"></div>
        <Button type="submit" className="w-full" loading={loading}>
          Submit
        </Button>
      </form>
    </OnboardingCard>
  );
}

export function EnterPhoneNumber(props: EnterPhoneNumberProps) {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
      <EnterPhoneNumberInside {...props} />
    </GoogleReCaptchaProvider>
  );
}
