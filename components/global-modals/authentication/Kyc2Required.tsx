import { useRouter } from 'next/router';

import { AuthStatus, useAuthStatus } from '../../../hooks/kyc';
import { useModalState } from '../../../hooks/modal';
import { ModalState } from '../../../lib/types/modalState';
import { Button, Text } from '../../base';
import { TitledModal } from '../../modals/TitledModal';

export function Kyc2Required(props: {}) {
  const router = useRouter();
  const [authModalState, setAuthModalState] = useModalState();

  const status = useAuthStatus();

  if (status.authStatus !== AuthStatus.KycLevel1) {
    // This modal should only be shown if the user is at kyc level 1
    return null;
  }

  const message =
    status.level2AppStatus === 'actions-needed'
      ? 'Finish your KYC Level 2 application to continue.'
      : status.level2AppStatus === 'pending'
      ? 'Your KYC Level 2 application is pending. Please wait for approval.'
      : 'Please upload identity documents in order to perform this action.';

  const action =
    status.level2AppStatus === 'actions-needed'
      ? 'Contact Support'
      : status.level2AppStatus === 'pending'
      ? 'View Account Settings'
      : 'Upload Documents';

  return (
    <TitledModal
      title="Kyc Level 2 Required"
      darkenBackground={false}
      isOpen={authModalState.state === ModalState.Kyc2Required}
      onClose={() => setAuthModalState({ state: ModalState.Closed })}
    >
      <div className="flex flex-col items-center px-6 py-8">
        <Text>{message}</Text>
        <div className="h-6"></div>
        <Button
          className="w-full"
          onClick={() => {
            setAuthModalState({ state: ModalState.Closed });
            router.push('/account?tabIndex=1');
          }}
        >
          {action}
        </Button>
      </div>
    </TitledModal>
  );
}
