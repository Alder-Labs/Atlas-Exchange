import React, { useEffect, useState } from 'react';

import { faMobileScreenButton } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { useLoginStatus } from '../../hooks/useLoginStatus';
import { useModal } from '../../hooks/useModal';
import { useUserState } from '../../lib/auth-token-context';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { MfaType, RecaptchaActions } from '../../lib/types';
import { Text, Button, TextInput, Select } from '../base';
import { TitledModal } from '../modals/TitledModal';


import { ExistingMfaInput } from './ExistingMfaInput';


const RECAPTCHA_KEY = process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY ?? '';

interface SetSmsMfaForm {
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

const countryCodeOption: { value: string; label: string }[] = [
  { value: '+1', label: '+1' },
];

export function SetSmsModalInside(props: { mfa: MfaType }) {
  const [open, handlers] = useModal(false);
  const [existingMfaCode, setExistingMfaCode] = useState('');
  const { refetch: refetchLoginStatus, data: loginData } = useLoginStatus();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const userState = useUserState();

  const cachedForm = JSON.parse(localStorage.getItem('kycForm') || '{}');
  const {
    setValue,
    register,
    clearErrors,
    setError,
    getValues,
    handleSubmit,
    control,
    formState,
  } = useForm<SetSmsMfaForm>({ defaultValues: cachedForm });

  useEffect(() => {
    setValue('countryCode', countryCodeOption[0].value);
  }, [setValue]);

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
        onFetchSuccess: (res) =>
          new Promise((resolve, reject) => {
            if (userState.user) {
              userState.setAuthToken(res.token, async (token) => {
                if (token) {
                  await refetchLoginStatus();
                  resolve(res);
                } else {
                  reject();
                }
              });
            } else {
              reject();
            }
          }),
      }
    ),
    {
      onSuccess: (res) => {
        toast.success('Successfully enabled SMS MFA');
        handlers.close();
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

    if (!executeRecaptcha) {
      toast.error('executeRecaptcha is null');
      return;
    }

    const token = await executeRecaptcha(RecaptchaActions.SMS).catch(() => {
      toast.error('Error: reCaptcha failed');
      return null;
    });
    if (!token) {
      return;
    }

    requestPhoneVerification({
      phoneNumber: countryCode + phoneNumber,
      captcha: {
        recaptcha_challenge: token,
      },
    });
  };

  const onSubmit = (data: SetSmsMfaForm) => {
    const reqData: SetSmsMfaRequest = {
      phoneNumber: `${data.countryCode}${data.phoneNumber}`,
      code: data.code,
      existingCode: existingMfaCode,
    };
    verifyPhoneVerification(reqData);
  };

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
        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
          <label className="dark:text-grayDark-80 block text-sm font-medium text-black">
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
                  options={countryCodeOption.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
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
                    >
                      Send SMS
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
        </GoogleReCaptchaProvider>
      </TitledModal>
    </>
  );
}

export function SetSmsModal(props: { mfa: MfaType }) {
  return (
    <SetSmsModalInside {...props} />
  );
}
