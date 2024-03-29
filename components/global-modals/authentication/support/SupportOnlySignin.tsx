import React, { useState } from 'react';

import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { useModalState } from '../../../../hooks/modal';
import { getDeviceId } from '../../../../lib/localStorage';
import { useMutationFetcher } from '../../../../lib/mutation';
import { getReCaptchaTokenOrError } from '../../../../lib/reCaptcha';
import { toast } from '../../../../lib/toast';
import {
  RECAPTCHA_KEY,
  RecaptchaActions,
  SupportOnlyLinkRequest,
} from '../../../../lib/types';
import { ModalState } from '../../../../lib/types/modalState';
import { Button, Text, TextInput } from '../../../base';
import { TitledModal } from '../../../modals/TitledModal';

const SupportOnlySignin = () => {
  const [modalState, setModalState, handlers] = useModalState();

  const [email, setEmail] = useState<string>('');

  return (
    <>
      <TitledModal
        title="Request a Support Link"
        onClose={() => {
          setModalState({ state: ModalState.Closed });
        }}
        darkenBackground={false}
        isOpen={modalState.state === ModalState.GetSupportOnlyLink}
      >
        <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
          <SupportOnlySigninForm setEmail={setEmail} />
        </GoogleReCaptchaProvider>
      </TitledModal>

      <TitledModal
        title="Email Sent"
        onClose={() => {
          setModalState({ state: ModalState.Closed });
        }}
        onGoBack={() => {
          handlers.goBack();
        }}
        darkenBackground={false}
        isOpen={modalState.state === ModalState.GetSupportOnlyLinkSuccess}
      >
        <SupportOnlySigninSuccess email={email} />
      </TitledModal>
    </>
  );
};

const SupportOnlySigninForm = (props: {
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const {
    watch,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({
    defaultValues: { email: '' },
  });

  const { setEmail } = props;
  const [, setModalState] = useModalState();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [showNoAccountFound, setShowNoAccountFound] = useState(false);

  const { isLoading: requestEmailIsLoading, mutate: requestEmail } =
    useMutation(
      useMutationFetcher<SupportOnlyLinkRequest, {}>(
        `/support/verification_code`
      ),
      {
        onSuccess: (data) => {
          toast.success('Success');
        },
        onError: (err: Error) => {
          toast.error(`Error: ${err.message}`);
          setShowNoAccountFound(true);
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
      setEmail(data.email);
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

  function goToCreatePublicTicket() {
    setModalState({ state: ModalState.CreatePublicTicket });
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

        {showNoAccountFound && (
          <>
            <div className={'h-12'} />
            <Text>Email not showing up? Please click CONTACT US below.</Text>
            <div className={'h-6'} />
            <Button
              disabled={watch('email').length <= 0}
              type="button"
              className="w-full"
              onClick={goToCreatePublicTicket}
            >
              Contact us
            </Button>
          </>
        )}
      </div>
    </form>
  );
};

const SupportOnlySigninSuccess = (props: { email: string }) => {
  const { email } = props;
  const [, setModalState] = useModalState();

  function goToCreatePublicTicket() {
    setModalState({ state: ModalState.CreatePublicTicket });
  }

  return (
    <div className="p-6">
      <Text>
        We have sent a support link to {email}. Please check your inbox.
      </Text>
      <div className={'h-6'} />
      <Text>Email not showing up? Please click CONTACT US below.</Text>
      <div className={'h-6'} />
      <Button type="button" className="w-full" onClick={goToCreatePublicTicket}>
        Contact us
      </Button>
    </div>
  );
};

export default SupportOnlySignin;
