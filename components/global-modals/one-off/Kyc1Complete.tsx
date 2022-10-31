import { useModalState } from '../../../hooks/modal';
import { ModalState } from '../../../lib/types/modalState';
import { Button, Text } from '../../base';
import { TitledModal } from '../../modals/TitledModal';

interface Kyc1CompleteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Kyc1Complete(props: Kyc1CompleteProps) {
  const [modalState, setModalState, handlers] = useModalState();

  const { isOpen, onClose } = props;

  return (
    <TitledModal
      isOpen={isOpen}
      onClose={onClose}
      title="Level 1 Verification Complete"
      darkenBackground={false}
    >
      <div className="flex flex-col items-center px-6 py-8">
        <div className="h-2"></div>
        <Text>You may now send and receive crypto!</Text>
        <div className="h-10"></div>
        <Button
          onClick={() => {
            setModalState({ state: ModalState.SendReceiveCrypto });
          }}
          className="w-full"
        >
          Send/Receive Crypto
        </Button>
        <div className="h-2" />
        <Button onClick={onClose} variant="secondary" className="w-full">
          Continue to app
        </Button>
      </div>
    </TitledModal>
  );
}
