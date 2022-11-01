import React, { useState } from 'react';

import { faMobileScreenButton } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { iso31661Alpha2ToAlpha3 } from 'iso-3166';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { useModal } from '../../hooks/modal';
import { useCurrentDate } from '../../hooks/utils';
import { useUserState } from '../../lib/auth-token-context';
import {
  countryPhoneNumberCodes,
  ALPHA2_TO_PHONE_CODES,
} from '../../lib/country-phone-number';
import { requireEnvVar } from '../../lib/env';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { MfaType, RecaptchaActions } from '../../lib/types';
import { Text, Button, TextInput, Select } from '../base';
import { TitledModal } from '../modals/TitledModal';

import { ExistingMfaInput } from './ExistingMfaInput';

const RECAPTCHA_KEY = requireEnvVar('NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY');
interface SetSmsMfaFormType {
  countryCode: string;
  phoneNumber: string;
  code: string;
}

interface SetSmsMfaRequest {
  phoneNumber: string;
  code: string;
  existingCode: string;
}

interface RequestPhoneVerification {
  phoneNumber: string;
  captcha: {
    recaptcha_challenge: string;
  };
}

function getDefaultCountryCode(country?: string) {
  if (!country) {
    return '+1';
  }
  const countryPhoneCode = ALPHA2_TO_PHONE_CODES[country];

  return countryPhoneCode;
}

export function SetSmsMfaForm(props: { onSuccess: () => void }) {
  const { onSuccess } = props;

  const [existingMfaCode, setExistingMfaCode] = useState('');
  const { executeRecaptcha } = useGoogleReCaptcha();
  const userState = useUserState();

  const {
    register,
    clearErrors,
    setError,
    getValues,
    handleSubmit,
    control,
    formState,
  } = useForm<SetSmsMfaFormType>({
    defaultValues: {
      countryCode: getDefaultCountryCode(userState.loginStatusData?.country),
    },
  });

  // Phone Number Verification Code Timer
  const currentDate = useCurrentDate();
  const [codeLastSent, setCodeLastSent] = useState<Date | null>(null);
  const secondsRemaining = Math.max(
    0,
    codeLastSent
      ? 59 - Math.floor((currentDate.getTime() - codeLastSent.getTime()) / 1000)
      : 0
  );

  const { errors } = formState;
  const {
    isLoading: requestPhoneVerificationLoading,
    mutate: requestPhoneVerification,
  } = useMutation(
    useMutationFetcher<RequestPhoneVerification, {}>(
      `/proxy/api/mfa/sms/setup`
    ),
    {
      onSuccess: (data) => {
        toast.success('Successfully requested phone verification');
        setCodeLastSent(new Date());
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  const {
    isLoading: verifyPhoneVerificationLoading,
    mutate: verifyPhoneVerification,
  } = useMutation(
    useMutationFetcher<SetSmsMfaRequest, { token: string }>(
      '/api/mfa/sms/setup/verify',
      {
        onFetchSuccess: async (res) => {
          return userState.updateToken(res.token);
        },
      }
    ),
    {
      onSuccess: (res) => {
        toast.success('Successfully enabled SMS MFA');
        onSuccess();
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

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

  const onSubmit = (data: SetSmsMfaFormType) => {
    const reqData: SetSmsMfaRequest = {
      phoneNumber: `+${data.countryCode}${data.phoneNumber}`,
      code: data.code,
      existingCode: existingMfaCode,
    };
    verifyPhoneVerification(reqData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <label className="block text-sm font-medium text-black dark:text-grayDark-80">
        Phone Number
      </label>
      <div className="h-1"></div>

      <div className="grid grid-cols-4 items-start gap-4 lg:items-center">
        <Controller
          name={'countryCode'}
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              value={field.value}
              onSelect={(value) => {
                if (value) {
                  field.onChange(value);
                }
              }}
              options={countryPhoneNumberCodes}
              className="col-span-1 w-full items-center"
            />
          )}
        />
        <div className={'col-span-3 flex flex-row items-end'}>
          <div className="w-full">
            <div className="relative w-full">
              <TextInput
                placeholder={'Phone Number'}
                {...register('phoneNumber', { required: true })}
                className="w-full"
              />
              <div className="right-2 top-0 mt-2 flex h-full justify-end lg:absolute lg:mt-0 lg:items-center">
                <Button
                  size="sm"
                  rounded="md"
                  onClick={onRequestSmsCode}
                  loading={requestPhoneVerificationLoading}
                  type="button"
                  disabled={secondsRemaining > 0}
                >
                  {requestPhoneVerificationLoading
                    ? 'Sending...'
                    : secondsRemaining
                    ? `Resend (${secondsRemaining})`
                    : `Send SMS`}
                </Button>
              </div>
            </div>
            {errors.phoneNumber?.type === 'required' && (
              <Text color="error" size="xs">
                {'required'}
              </Text>
            )}
          </div>
        </div>
      </div>
      <div className="h-6"></div>
      <TextInput
        label={'SMS Verification Code *'}
        placeholder={'SMS Verification Code'}
        {...register('code', { required: true })}
      />
      <div className="h-6"></div>
      <ExistingMfaInput
        label="Existing MFA Code (you have SMS MFA enabled and code is required for this action)"
        placeholder="Existing MFA Code"
        value={existingMfaCode}
        onChange={setExistingMfaCode}
      />

      <div className="h-8"></div>
      <Button
        type="submit"
        className="w-full"
        loading={verifyPhoneVerificationLoading}
      >
        Enable SMS MFA
      </Button>
    </form>
  );
}

export function SetSmsModalInside(props: { mfa: MfaType }) {
  const [open, handlers] = useModal(false);

  const btnText = (mfa: MfaType) => {
    switch (mfa) {
      case 'sms':
        return 'SMS (Enabled)';
      case null:
        return 'Enable SMS 2FA';
      default:
        return 'Switch to SMS';
    }
  };

  const btnDisabled = props.mfa === 'sms';
  const btnStyle = clsx({
    ['flex justify-start items-center px-8 py-3.5 rounded-full duration-300']:
      true,
    ['hover:bg-black/25 hover:dark:bg-white/25']: !btnDisabled,
    ['bg-greenLight/50 dark:bg-greenDark/50']: btnDisabled,
  });

  return (
    <>
      <button
        className={btnStyle}
        onClick={handlers.open}
        disabled={btnDisabled}
      >
        <FontAwesomeIcon icon={faMobileScreenButton} className="w-4" />
        <div className="w-4" />
        <Text>{btnText(props.mfa)}</Text>
      </button>

      <TitledModal
        isOpen={open}
        title={'Setup SMS MFA'}
        onClose={handlers.close}
      >
        <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
          <SetSmsMfaForm onSuccess={handlers.close} />
        </GoogleReCaptchaProvider>
      </TitledModal>
    </>
  );
}

export function SetSmsModal(props: { mfa: MfaType }) {
  return <SetSmsModalInside {...props} />;
}
