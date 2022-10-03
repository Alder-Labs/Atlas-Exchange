import { useRouter } from 'next/router';

import { useModalState } from '../../../hooks/useModalState';
import { ModalState } from '../../../lib/types/modalState';
import { Button, Text } from '../../base';
import { TitledModal } from '../../modals/TitledModal';

interface Kyc1RequiredProps {}

export function Kyc1Required(props: Kyc1RequiredProps) {
  const router = useRouter();
  const [authModalState, setAuthModalState] = useModalState();

  return (
    <TitledModal
      title="Kyc Level 1 Required"
      darkenBackground={false}
      isOpen={authModalState.state === ModalState.Kyc1Required}
      onClose={() => setAuthModalState({ state: ModalState.Closed })}
    >
      <div className="flex flex-col items-center px-6 py-8">
        <Text>Verify your identity to continue.</Text>
        <div className="h-6"></div>
        <Button
          className="w-full"
          onClick={() => {
            setAuthModalState({ state: ModalState.Closed });
            router.push('/onboarding');
          }}
        >
          Verify
        </Button>
      </div>
    </TitledModal>
  );
}
