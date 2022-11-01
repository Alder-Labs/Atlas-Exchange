import React, { useState } from 'react';

import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { useMutation } from 'react-query';

import { useCurrentDate } from '../../hooks/utils';
import { useUserState } from '../../lib/auth-token-context';
import { requireEnvVar } from '../../lib/env';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { RecaptchaActions } from '../../lib/types';
import { Button, Spinner, TextInput } from '../base';

const RECAPTCHA_KEY = requireEnvVar('NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY');

interface ExistingMfaProps {
  label?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}

interface TotpMfaInput extends ExistingMfaProps {}

function TotpMfaInput(props: TotpMfaInput) {
  const { label, placeholder, value, required = false, onChange } = props;

  return (
    <TextInput
      required
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        // Digits only
        onChange(e.target.value.replace(/[^0-9]/g, ''));
      }}
    />
  );
}

interface SmsMfaProps extends ExistingMfaProps {}
function SmsMfaInput(props: SmsMfaProps) {
  const { label, placeholder, value, required = false, onChange } = props;

  // Phone Number Verification Code Timer
  const currentDate = useCurrentDate();
  const [codeLastSent, setCodeLastSent] = useState<Date | null>(null);
  const secondsRemaining = Math.max(
    0,
    codeLastSent
      ? 59 - Math.floor((currentDate.getTime() - codeLastSent.getTime()) / 1000)
      : 0
  );

  const { isLoading: requestSmsLoading, mutate: requestSms } = useMutation(
    useMutationFetcher<{ phoneNumber: string }, {}>(
      `/proxy/api/mfa/sms/request`
    ),
    {
      onSuccess: (data) => {
        toast.success('Successfully sent MFA code via SMS');
        setCodeLastSent(new Date());
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  const { executeRecaptcha } = useGoogleReCaptcha();

  // Request SMS verification code is sent to phone
  const onRequestSmsCode = async () => {
    let inputData = {
      phoneNumber: '',
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
    requestSms(inputData);
  };

  return (
    <TextInput
      required
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        // Digits only
        onChange(e.target.value.replace(/[^0-9]/g, ''));
      }}
      className="w-full"
      renderSuffix={() => (
        <Button
          size="sm"
          rounded="md"
          onClick={onRequestSmsCode}
          loading={requestSmsLoading}
          type="button"
          className="mr-2"
          disabled={secondsRemaining > 0}
        >
          {requestSmsLoading
            ? 'Sending...'
            : secondsRemaining
            ? `Resend (${secondsRemaining})`
            : `Send SMS`}
        </Button>
      )}
    />
  );
}

function LoadingPlaceholder() {
  return (
    <div className="flex w-full items-center justify-center">
      <Spinner />
    </div>
  );
}

function SmsMfaInputWrapper(props: SmsMfaProps) {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
      <SmsMfaInput {...props} />
    </GoogleReCaptchaProvider>
  );
}

export function ExistingMfaInput(props: ExistingMfaProps) {
  const userState = useUserState();
  const loginStatus = userState.loginStatusData;

  if (!loginStatus?.loggedIn) {
    return <LoadingPlaceholder />;
  }
  if (!loginStatus?.user) {
    return <LoadingPlaceholder />;
  }

  return (
    <div>
      {loginStatus.user.mfa === 'sms' && <SmsMfaInputWrapper {...props} />}
      {loginStatus.user.mfa === 'totp' && <TotpMfaInput {...props} />}
    </div>
  );
}
