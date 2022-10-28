import React from 'react';

import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from 'react-google-recaptcha-v3';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { useModalState } from '../../../../hooks/useModalState';
import { BRAND_NAME } from '../../../../lib/constants';
import { getDeviceId } from '../../../../lib/localStorage';
import { useMutationFetcher } from '../../../../lib/mutation';
import { getReCaptchaTokenOrError } from '../../../../lib/reCaptcha';
import { toast } from '../../../../lib/toast';
import {
  PublicCreateTicket,
  RECAPTCHA_KEY,
  RecaptchaActions,
} from '../../../../lib/types';
import { ModalState } from '../../../../lib/types/modalState';
import { Button, Text, TextAreaWithLabel, TextInput } from '../../../base';
import { TitledModal } from '../../../modals/TitledModal';

type CreatePublicTicket = {
  email: string;
  firstName: string;
  lastName: string;
  userMessage: string;
};

const CreatePublicTicket = () => {
  const [modalState, setModalState, handlers] = useModalState();

  const defaultModalProps = {
    onClose: () => {
      setModalState({ state: ModalState.Closed });
    },
    onGoBack: () => {
      handlers.goBack();
    },
    darkenBackground: false,
  };

  // For publicly created tickets (without email verification) a
  // passphrase is returned to the user upon creation. This passphrase
  // should be saved by the user and used to verify that support responses
  // are coming from the correct support agent.
  const [ticketSuccessPassphrase, setTicketSuccessPassphrase] =
    React.useState<string>('');

  return (
    <>
      <TitledModal
        title="Contact Us"
        {...defaultModalProps}
        isOpen={modalState.state === ModalState.CreatePublicTicket}
      >
        <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
          <CreatePublicTicketForm setPassphrase={setTicketSuccessPassphrase} />
        </GoogleReCaptchaProvider>
      </TitledModal>

      <TitledModal
        title="Ticket Submitted"
        {...defaultModalProps}
        isOpen={modalState.state === ModalState.CreatePublicTicketSuccess}
      >
        <CreatePublicTicketSuccess passphrase={ticketSuccessPassphrase} />
      </TitledModal>
    </>
  );
};

const CreatePublicTicketForm = (props: {
  setPassphrase: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const {
    watch,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePublicTicket>({
    defaultValues: { email: '', firstName: '', lastName: '' },
  });

  const [modalState, setModalState] = useModalState();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const { isLoading: createTicketIsLoading, mutate: createTicket } =
    useMutation(
      useMutationFetcher<PublicCreateTicket, { result: string }>(
        `/proxy/api/support/logged_out_ticket`
      ),
      {
        onSuccess: (data) => {
          toast.success('Success');
          props.setPassphrase(data.result);
          setModalState({ state: ModalState.CreatePublicTicketSuccess });
        },
        onError: (err: Error) => {
          toast.error(`Error: ${err.message}`);
        },
      }
    );

  async function onCreateTicket(formData: CreatePublicTicket) {
    const deviceId = getDeviceId();

    const captchaRes = await getReCaptchaTokenOrError({
      executeRecaptcha,
      reCaptchaAction: RecaptchaActions.SUPPORT,
    });

    if (captchaRes.ok) {
      createTicket({
        captcha: { recaptcha_challenge: captchaRes.token },
        deviceId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userMessage: formData.userMessage,
      });
    } else {
      // TODO: log relevant captcha data to sentry
      console.error(captchaRes.errors);
      toast.error('ReCaptcha failed. Please contact support.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onCreateTicket)}>
      <div className="p-6">
        <div className={'h-4'} />
        <TextInput
          label="Email"
          placeholder="Email"
          {...register('email', { required: true })}
        />
        <div className={'h-6'} />
        <TextInput
          label="First Name"
          placeholder="First Name"
          {...register('firstName', { required: true })}
        />
        <div className={'h-6'} />
        <TextInput
          label="Last Name"
          placeholder="Last Name"
          {...register('lastName', { required: true })}
        />
        <div className={'h-6'} />
        <TextAreaWithLabel
          className={'w-full'}
          label="Message *"
          placeholder="Enter message here"
          textAreaClassName="h-36"
          {...register('userMessage', { required: true })}
        />
        <div className={'h-6'} />
        <Button
          disabled={watch('email').length <= 0}
          type="submit"
          className="w-full"
          loading={createTicketIsLoading}
        >
          Request Support Link
        </Button>
      </div>
    </form>
  );
};

const CreatePublicTicketSuccess = (props: { passphrase: string }) => {
  const [modalState, setModalState] = useModalState();

  function closeModal() {
    setModalState({ state: ModalState.Closed });
  }

  return (
    <>
      <div className="p-6">
        <div className={'h-4'} />
        <Text>
          The {BRAND_NAME} customer service team will reach out to you at
          pleaseignore@gmail.com. When {BRAND_NAME} customer service contacts
          you, they will use the following random passphrase to identify
          themselves as {BRAND_NAME} Customer Support.
        </Text>

        <Text>
          Passphrase (please write this down and do not share it with anyone.
          {BRAND_NAME} will never ask you for your passphrase, they will provide
          it themselves.): {props.passphrase}
        </Text>
        <div className={'h-6'} />
        <Button type="button" className="w-full" onClick={closeModal}>
          Done
        </Button>
      </div>
    </>
  );
};

export default CreatePublicTicket;
