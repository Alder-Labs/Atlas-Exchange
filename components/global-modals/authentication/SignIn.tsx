import React, { useEffect, useState } from "react";

import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { useModalState } from '../../../hooks/useModalState';
import { useUserState } from '../../../lib/auth-token-context';
import { useMutationFetcher } from '../../../lib/mutation';
import { toast } from '../../../lib/toast';
import { SigninParams, SignInResponse } from '../../../lib/types';
import { ModalState } from '../../../lib/types/modalState';
import { RecaptchaActions, RECAPTCHA_KEY } from '../../../lib/types/recaptcha';
import { TextInput, TextButton, Button, Text } from '../../base';
import { TitledModal } from '../../modals/TitledModal';

interface SignInProps {}

export function SignIn(props: SignInProps) {
  const router = useRouter();
  const [modalState, setModalState] = useModalState();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect to home if user is already logged in
  const userState = useUserState();

  const { executeRecaptcha } = useGoogleReCaptcha();

  function handleMfa(signinRes: SignInResponse) {
    if (!signinRes.mfaRequired) {
      router.push("/onboarding");
      return;
    }
    switch (signinRes.mfaMethod) {
      case "email":
        // setAuthModalState(AuthModalState.EmailAuth);
        // Note: This should never happen, since email mfa is not used.
        setModalState({ state: ModalState.Closed });
        break;
      case "sms":
        setModalState({ state: ModalState.SmsAuth });
        break;
      case "totp":
        setModalState({ state: ModalState.TotpAuth });
        break;
      default:
        setModalState({ state: ModalState.Closed });
        break;
    }
  }

  const {
    watch,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSignIn = () =>
    handleSubmit(async (data) => {
      let inputData = {
        ...data,
        captcha: {
          recaptcha_challenge: '',
        },
      };

      if (!executeRecaptcha) {
        toast.error('Error: reCAPTCHA not loaded.');
        return;
      }

      try {
        const captchaToken = await executeRecaptcha(RecaptchaActions.LOGIN);
        inputData.captcha.recaptcha_challenge = captchaToken;
      } catch (e) {
        toast.error('Error: reCAPTCHA failed. Please contact Support.');
        return;
      }

      setIsLoggingIn(true);
      if (!userState.user) {
        userState
          .signin(inputData)
          .then((data) => {
            handleMfa(data);
          })
          .catch((err: Error) => {
            toast.error(`Error: ${err.message}`);
          })
          .finally(() => {
            setIsLoggingIn(false);
          });
      } else {
        setIsLoggingIn(false);
      }
    });

  const { isLoading: changePasswordLoading, mutate: changePassword } =
    useMutation(
      useMutationFetcher<{}, {}>(`/proxy/api/users/public_change_password`),
      {
        onSuccess: (data) => {
          toast.success("Reset password email sent.");
        },
        onError: (error) => {
          toast.error(`Error resetting password. Please contact support.`);
        },
      }
    );

  // Clear all fields on state change
  useEffect(() => {
    reset();
  }, [modalState, reset]);

  const onSignUp = () => {
    setModalState({ state: ModalState.SignUp });
  };

  const [passwordIsShowing, setPasswordIsShowing] = useState(false);
  const toggleShowPassword = () => {
    setPasswordIsShowing((prev) => !prev);
  };

  return (
    <div className="px-4 pb-6">
      <div className="h-8"></div>
      <form onSubmit={onSignIn()} className="mx-auto w-full">
        <TextInput
          id="email-input"
          placeholder={'Email'}
          label="Email"
          {...register('email', { required: true })}
        />
        <div className="h-6"></div>
        <TextInput
          label="Password"
          placeholder={'Password'}
          type={passwordIsShowing ? 'text' : 'password'}
          id={'inline-password'}
          renderSuffix={() => (
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
          )}
          {...register('password', { required: true })}
        />
        <div className="mt-2.5 flex w-full">
          <TextButton
            variant={'primary'}
            className="mr-1 ml-auto"
            onClick={(e) => {
              setModalState({ state: ModalState.ForgotPassword });
            }}
          >
            Forgot Password?
          </TextButton>
        </div>
        <div className="h-6"></div>

        <Button
          type="submit"
          className="w-full"
          loading={isLoggingIn}
          disabled={
            watch('email').length === 0 || watch('password').length === 0
          }
        >
          Sign in
        </Button>
      </form>
      <div className="w-fulsl mx-auto mt-4 flex items-center justify-center">
        <Text>Don&apos;t have an account?&nbsp; </Text>
        <TextButton
          onClick={onSignUp}
          className="text-textAccent"
          type="button"
        >
          Sign up
        </TextButton>
      </div>
    </div>
  );
}

export const SignInWrapper = () => {
  const [modalState, setModalState] = useModalState();

  return (
    <TitledModal
      title="Sign In"
      darkenBackground={false}
      isOpen={modalState.state === ModalState.SignIn}
      onClose={() => setModalState({ state: ModalState.Closed })}
      renderWhenClosed={modalState.state === ModalState.Closed}
    >
      <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
        <SignIn />
      </GoogleReCaptchaProvider>
    </TitledModal>
  );
};

export default SignInWrapper;
