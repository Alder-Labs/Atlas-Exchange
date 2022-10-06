import React from 'react';

import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { useMutation } from 'react-query';

import { useLoginStatus } from '../../hooks/useLoginStatus';
import { requireEnvVar } from '../../lib/env';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { RecaptchaActions } from '../../lib/types';
import { Button, TextInput } from '../base';

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
  const { isLoading: requestSmsLoading, mutate: requestSms } = useMutation(
    useMutationFetcher<{ phoneNumber: string }, {}>(
      `/proxy/api/mfa/sms/request`
    ),
    {
      onSuccess: (data) => {
        toast.success('Successfully sent MFA code via SMS');
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
        >
          Send SMS
        </Button>
      )}
    />
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
  const { data: loginStatus, isLoading: loginStatusLoading } = useLoginStatus();

  // TODO: Making loading cooler
  if (!loginStatus) {
    return <></>;
  }
  if (!loginStatus.loggedIn) {
    return <></>;
  }
  if (!loginStatus.user) {
    return <></>;
  }

  return (
    <div>
      {loginStatus.user.mfa === 'sms' && <SmsMfaInputWrapper {...props} />}
      {loginStatus.user.mfa === 'totp' && <TotpMfaInput {...props} />}
    </div>
  );
}
