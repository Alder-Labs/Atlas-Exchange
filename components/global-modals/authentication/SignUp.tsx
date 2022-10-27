import React, { useEffect, useState } from 'react';

import {
  faCheckCircle,
  faEye,
  faEyeSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { iso31661Alpha2ToAlpha3 } from 'iso-3166';
import { useRouter } from 'next/router';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { useForm } from 'react-hook-form';

import { useLoginStatus } from '../../../hooks/useLoginStatus';
import { useModalState } from '../../../hooks/useModalState';
import { SignupParams, useUserState } from '../../../lib/auth-token-context';
import { BRAND_NAME } from '../../../lib/constants';
import {
  ALPHA3_TO_COUNTRY_NAME,
  EU_COUNTRIES,
} from '../../../lib/country-codes';
import { toast } from '../../../lib/toast';
import { RECAPTCHA_KEY, RecaptchaActions } from '../../../lib/types';
import { ModalState } from '../../../lib/types/modalState';
import { UserStateStatus } from '../../../lib/types/user-states';
import { Button, InputCheckbox, Text, TextButton, TextInput } from '../../base';
import { TitledModal } from '../../modals/TitledModal';

const RecaptchaSignUpWrapper = () => {
  const [modalState, setModalState] = useModalState();
  return (
    <TitledModal
      isOpen={modalState.state === ModalState.SignUp}
      title="Sign Up"
      darkenBackground={false}
      onClose={() => setModalState({ state: ModalState.Closed })}
    >
      <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
        <SignUpModal />
      </GoogleReCaptchaProvider>
    </TitledModal>
  );
};

export default RecaptchaSignUpWrapper;

interface SignUpProps {}

const SignUpModal = (props: SignUpProps) => {
  const router = useRouter();
  const { data: loginStatus } = useLoginStatus();
  const userState = useUserState();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [modalState, setModalState] = useModalState();

  const [agreed, setAgreed] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const {
    watch,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupParams>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Clear all fields on state change
  useEffect(() => {
    reset();
    setAgreed(false);
  }, [modalState, reset]);

  const onSignUp = async (data: Omit<SignupParams, 'captcha'>) => {
    if (!agreed) {
      toast.error('You must agree to the terms and conditions');
      return;
    }

    const password: string = data.password;
    const isValid = validatePassword(password).isValid;
    if (!isValid) {
      toast.error('Invalid password');
      return;
    }

    if (!executeRecaptcha) {
      toast.error('Error: reCAPTCHA not loaded.');
      return;
    }

    let recaptchaToken: string;
    try {
      recaptchaToken = await executeRecaptcha(RecaptchaActions.REGISTER);
    } catch (e) {
      toast.error('Error: reCAPTCHA failed. Please contact Support.');
      return;
    }

    const inputData = {
      ...data,
      captcha: { recaptcha_challenge: recaptchaToken },
    };

    const alpha3Code = iso31661Alpha2ToAlpha3[loginStatus?.country ?? ''];
    const countryName = ALPHA3_TO_COUNTRY_NAME[alpha3Code];
    if (EU_COUNTRIES.has(alpha3Code)) {
      toast.error(`Error: Registration is not allowed in ${countryName}`);
      return;
    }

    if (userState.status === UserStateStatus.SIGNED_OUT) {
      setIsSigningUp(true);
      userState
        .signUp(inputData)
        .then(() => {
          router.push('/onboarding').then(() => {
            setModalState({ state: ModalState.Closed });
          });
        })
        .catch((err: Error) => {
          toast.error(`Error: ${err.message}`);
        })
        .finally(() => {
          setIsSigningUp(false);
        });
    }
  };

  const [passwordIsShowing, setPasswordIsShowing] = useState(false);
  const toggleShowPassword = () => {
    setPasswordIsShowing(!passwordIsShowing);
  };

  const onGoToSignIn = () => {
    setModalState({ state: ModalState.SignIn });
  };

  return (
    <div className="px-4 pb-6 pt-8">
      <form onSubmit={handleSubmit(onSignUp)}>
        <TextInput
          label="Email"
          placeholder={'Email'}
          {...register('email', { required: true })}
        />
        <div className="h-6"></div>

        <TextInput
          label="Password"
          placeholder={'Password'}
          type={passwordIsShowing ? 'text' : 'password'}
          id={'inline-password'}
          renderSuffix={() => (
            <div>
              <TextButton
                onClick={toggleShowPassword}
                className="mx-3 duration-300 ease-in"
                size="md"
                type="button"
                variant="secondary"
              >
                {passwordIsShowing ? (
                  <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                ) : (
                  <FontAwesomeIcon icon={faEyeSlash} className="h-4 w-4" />
                )}
              </TextButton>
            </div>
          )}
          {...register('password', { required: true })}
        />
        {watch('password') && (
          <div className="mt-3 animate-enter">
            <PasswordRequirements password={watch('password')} />
          </div>
        )}

        <InputCheckbox
          label={
            <Text className="pl-2">
              I agree to {BRAND_NAME}{' '}
              <Text color="brand">
                <a href="">Terms of Service</a>
              </Text>
            </Text>
          }
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <div className="h-4"></div>
        <Button
          disabled={!agreed}
          type="submit"
          className="w-full"
          loading={isSigningUp}
        >
          Sign Up
        </Button>
        <div className="mx-auto mt-4 flex w-full items-center justify-center">
          <Text>Have an account?&nbsp; </Text>
          <TextButton
            onClick={onGoToSignIn}
            className="text-textAccent"
            type="button"
          >
            Sign In
          </TextButton>
        </div>
      </form>
    </div>
  );
};

type validatePasswordResult = {
  isValid: boolean;
  noSpaces: boolean;
  atLeast8Chars: boolean;
  hasLowerAndUpper: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
};

function validatePassword(password: string): validatePasswordResult {
  const noSpaces = !/\s/.test(password);
  const atLeast8Chars = password.length >= 8;
  const hasLowerAndUpper =
    !!password.match(/[a-z]/) && !!password.match(/[A-Z]/);
  const hasNumber = !!password.match(/[0-9]/);
  const hasSpecialChar = !!password.match(/[!@#$%^&*]/);

  const isValid =
    noSpaces &&
    atLeast8Chars &&
    hasLowerAndUpper &&
    hasNumber &&
    hasSpecialChar;

  return {
    noSpaces,
    atLeast8Chars,
    hasLowerAndUpper,
    hasNumber,
    hasSpecialChar,
    isValid,
  } as const;
}

function PasswordRequirement({
  satisfied,
  errorMessage,
}: {
  satisfied: boolean;
  errorMessage: string;
}) {
  return (
    <div className="flex items-center">
      {satisfied ? (
        <Text color="green">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-green-500 mr-2 h-4 w-4"
          />
        </Text>
      ) : (
        <Text color="secondary">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="text-red-500 mr-2 h-4 w-4"
          />
        </Text>
      )}
      <Text size="sm" color={satisfied ? 'normal' : 'secondary'}>
        {errorMessage}
      </Text>
    </div>
  );
}

export function PasswordRequirements({ password }: { password: string }) {
  const {
    noSpaces,
    atLeast8Chars,
    hasLowerAndUpper,
    hasNumber,
    hasSpecialChar,
  } = validatePassword(password);

  return (
    <div className="flex flex-col items-start gap-1">
      <PasswordRequirement
        satisfied={noSpaces}
        errorMessage="Must contain spaces"
      />
      <PasswordRequirement
        satisfied={atLeast8Chars}
        errorMessage="Must be at least 8 characters long"
      />
      <PasswordRequirement
        satisfied={hasLowerAndUpper}
        errorMessage="Must have at least one lowercase and one uppercase letter"
      />
      <PasswordRequirement
        satisfied={hasNumber}
        errorMessage="Must have at least one number"
      />
      <PasswordRequirement
        satisfied={hasSpecialChar}
        errorMessage="Must have at least one special character"
      />
    </div>
  );
}
