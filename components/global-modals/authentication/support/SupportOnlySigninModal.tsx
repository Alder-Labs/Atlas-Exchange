import React from 'react';

import { uuid4 } from '@sentry/utils';
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { useModalState } from '../../../../hooks/useModalState';
import { useMutationFetcher } from '../../../../lib/mutation';
import { getReCaptchaTokenOrError } from '../../../../lib/reCaptcha';
import { toast } from '../../../../lib/toast';
import {
  RECAPTCHA_KEY,
  RecaptchaActions,
  RequestSupportOnlyToken,
} from '../../../../lib/types';
import { ModalState } from '../../../../lib/types/modalState';
import { Button, Text, TextInput } from '../../../base';
import { TitledModal } from '../../../modals/TitledModal';

const SupportOnlySigninModal = () => {
  const [modalState, setModalState] = useModalState();

  return (
    <TitledModal
      title="Request a Support Link"
      onClose={() => {
        setModalState({ state: ModalState.Closed });
      }}
      darkenBackground={false}
      isOpen={modalState.state === ModalState.SupportOnlySignin}
    >
      <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
        <SupportOnlySigninForm />
      </GoogleReCaptchaProvider>
    </TitledModal>
  );
};

const SupportOnlySigninForm = () => {
  const {
    watch,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    defaultValues: { email: '' },
  });

  const { executeRecaptcha } = useGoogleReCaptcha();

  const { isLoading: requestEmailIsLoading, mutate: requestEmail } =
    useMutation(
      useMutationFetcher<RequestSupportOnlyToken, {}>(
        `/proxy/api/support/verification_code`
      ),
      {
        onSuccess: (data) => {
          toast.success('Success');
        },
        onError: (err: Error) => {
          toast.error(`Error: ${err.message}`);
        },
      }
    );

  async function onRequestSupportLink(data: { email: string }) {
    const deviceId = getDeviceId();

    const captchaRes = await getReCaptchaTokenOrError({
      executeRecaptcha,
      reCaptchaAction: RecaptchaActions.SUPPORT,
    });

    if (captchaRes.ok) {
      requestEmail({
        captcha: { recaptcha_challenge: captchaRes.token },
        deviceId,
        email: data.email,
      });
    } else {
      // TODO: log relevant captcha data to sentry
      console.error(captchaRes.errors);
      toast.error('ReCaptcha failed. Please contact support.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onRequestSupportLink)}>
      <div className="p-6">
        <Text>What is the email associated with your account?</Text>
        <div className={'h-4'} />
        <TextInput
          placeholder={'Email'}
          {...register('email', { required: true })}
        />
        <div className={'h-6'} />
        <Button
          disabled={watch('email').length <= 0}
          type="submit"
          className="w-full"
          loading={requestEmailIsLoading}
        >
          Request Support Link
        </Button>
      </div>
    </form>
  );
};
function getDeviceId() {
  return localStorage.getItem('deviceId') || undefined;
}

export default SupportOnlySigninModal;