import React from 'react';

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import { useModalState } from '../../../../hooks/useModalState';
import { BRAND_NAME } from '../../../../lib/constants';
import { RECAPTCHA_KEY } from '../../../../lib/types';
import { ModalState } from '../../../../lib/types/modalState';
import { Button, TextAreaWithLabel, TextInput, Text } from '../../../base';
import { TitledModal } from '../../../modals/TitledModal';

const CreatePublicTicketSuccess = () => {
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

  return (
    <TitledModal
      title="Ticket Submitted"
      {...defaultModalProps}
      isOpen={modalState.state === ModalState.CreatePublicTicketSuccess}
    >
      <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_KEY}>
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
            FTX US will never ask you for your passphrase, they will provide it
            themselves.): Dreary Tentacle
          </Text>

          <TextInput label="First Name" placeholder="First Name" />
          <div className={'h-6'} />
          <TextInput label="Last Name" placeholder="Last Name" />
          <div className={'h-6'} />
          <TextAreaWithLabel
            className={'w-full'}
            label="Message *"
            placeholder="Enter message here"
            textAreaClassName="h-36"
          />
          <div className={'h-6'} />
          <Button type="submit" className="w-full">
            Request Support Link
          </Button>
        </div>
      </GoogleReCaptchaProvider>
    </TitledModal>
  );
};

export default CreatePublicTicketSuccess;
