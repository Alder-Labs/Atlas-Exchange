import React, { useEffect } from 'react';

import { useAtom } from 'jotai';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { useModalState } from '../../../hooks/modal';
import { sardineDeviceIdAtom } from '../../../lib/jotai';
import { useMutationFetcher } from '../../../lib/mutation';
import { toast } from '../../../lib/toast';
import { RecaptchaActions, RECAPTCHA_KEY } from '../../../lib/types';
import { ModalState } from '../../../lib/types/modalState';
import { TextInput, Button, Text } from '../../base';
import { TitledModal } from '../../modals/TitledModal';

type PublicResetPasswordRequest = {
  deviceId?: string;
  email: string;
  captcha: {
    recaptcha_challenge: string;
  };
};

type ForgotPasswordForm = {
  email: string;
};

const ForgotPasswordModal = () => {
  const [sardineDeviceId] = useAtom(sardineDeviceIdAtom);
  const { executeRecaptcha } = useGoogleReCaptcha();

  const {
    watch,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: '',
    },
  });

  const {
    isLoading: requestPasswordResetIsLoading,
    mutate: requestPasswordReset,
  } = useMutation(
    useMutationFetcher<PublicResetPasswordRequest, {}>(
      `/users/public-change-password`
    ),
    {
      onSuccess: (data) => {
        toast.success('Reset password email sent.');
      },
      onError: (error) => {
        toast.error(`Error resetting password. Please contact support.`);
      },
    }
  );

  useEffect(() => {
    reset();
  }, [reset]);

  const onResetPassword = async (data: ForgotPasswordForm) => {
    if (!executeRecaptcha) {
      toast.error('Error: reCAPTCHA not loaded.');
      return;
    }

    let captchaToken: string;
    try {
      captchaToken = await executeRecaptcha(RecaptchaActions.CHANGEPASSWORD);
    } catch (e) {
      toast.error('Error: reCAPTCHA failed. Please contact Support.');
      return;
    }

    let inputData = {
      ...data,
      captcha: {
        recaptcha_challenge: captchaToken,
      },
    };

    requestPasswordReset({
      deviceId: sardineDeviceId,
      ...inputData,
    });
  };

  return (
    <form onSubmit={handleSubmit(onResetPassword)}>
      <div className="px-4 pb-6">
        <div className="h-6" />
        <Text color={'secondary'}>
          Please confirm you&apos;re using the official site.
        </Text>
        <div className="h-6" />
        <TextInput
          placeholder="Email"
          label={'Email'}
          {...register('email', { required: true })}
        />
        <div className="h-6" />
        <Button
          type="submit"
          className="w-full"
          loading={requestPasswordResetIsLoading}
          disabled={watch('email').length === 0}
        >
          Reset Password
        </Button>
      </div>
    </form>
  );
};

const ForgotPasswordModalWrapper = () => {
  const [modalState, setModalState, handlers] = useModalState();

  return (
    <TitledModal
      title={'Forgot Password'}
      darkenBackground={false}
      isOpen={modalState.state === ModalState.ForgotPassword}
      onClose={() => setModalState({ state: ModalState.Closed })}
      renderWhenClosed={modalState.state === ModalState.Closed}
      onGoBack={handlers.goBack}
    >
      <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
        <ForgotPasswordModal />
      </GoogleReCaptchaProvider>
    </TitledModal>
  );
};

export default ForgotPasswordModalWrapper;
