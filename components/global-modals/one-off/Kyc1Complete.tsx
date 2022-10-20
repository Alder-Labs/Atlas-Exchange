import { useModalState } from '../../../hooks/useModalState';
import { ModalState } from '../../../lib/types/modalState';
import { Button, Text } from '../../base';
import { TitledModal } from '../../modals/TitledModal';

export function Kyc1Complete() {
  const [modalState, setModalState] = useModalState();

  const onClose = () => {
    setModalState({ state: ModalState.Closed });
  };
  return (
    <TitledModal
      isOpen={modalState.state === ModalState.Kyc1Complete}
      onClose={onClose}
      title="Level 1 Verification Complete"
      darkenBackground={false}
    >
      <div className="flex flex-col items-center px-6 py-8">
        <div className="h-2"></div>
        <Text>You may now deposit funds to start trading.</Text>
        <div className="h-10"></div>
        <Button
          onClick={() => {
            setModalState({ state: ModalState.DepositFiat });
          }}
          className="w-full"
        >
          Deposit funds
        </Button>
        <div className="h-2"></div>
        <Button onClick={onClose} variant="secondary" className="w-full">
          Continue to app
        </Button>
      </div>
    </TitledModal>
  );
}
