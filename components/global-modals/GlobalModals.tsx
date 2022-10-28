import { Portal } from '@headlessui/react';

import { useModalState } from '../../hooks/useModalState';
import { ModalState } from '../../lib/types/modalState';
import { ModalBackdrop } from '../base/Modal';

import ForgotPasswordModal from './authentication/ForgotPasswordModal';
import { Kyc1Required } from './authentication/Kyc1Required';
import { Kyc2Required } from './authentication/Kyc2Required';
import { SmsAuth } from './authentication/mfa/SmsAuth';
import { TotpAuth } from './authentication/mfa/TotpAuth';
import { SignInWrapper } from './authentication/SignIn';
import SignUpModal from './authentication/SignUp';
import CreatePublicTicket from './authentication/support/CreatePublicTicket';
import SupportOnlySignin from './authentication/support/SupportOnlySignin';
import { ConnectBankAccount } from './deposit/ConnectBankAccount';
import DepositModal from './deposit/DepositModal';
import { Kyc1Complete } from './one-off/Kyc1Complete';
import SendModal from './send-receive/SendModal';
import { WithdrawModal } from './withdraw/WithdrawModal';

export const GlobalModals = () => {
  const [modalState, setModalState, handlers] = useModalState();

  return (
    <div>
      {modalState.state !== ModalState.Closed && (
        <Portal>
          <ModalBackdrop className="z-50" />
        </Portal>
      )}

      {/* One off modals */}
      <Kyc1Complete
        isOpen={modalState.state === ModalState.Kyc1Complete}
        onClose={() => {
          setModalState({ state: ModalState.Closed });
        }}
      />

      {/* Auth */}
      <SignInWrapper />
      <SignUpModal />
      <ForgotPasswordModal />
      <SmsAuth />
      <TotpAuth />
      <Kyc1Required />
      <Kyc2Required />

      {/* Deposit */}
      <DepositModal />
      <WithdrawModal />
      <ConnectBankAccount
        isOpen={modalState.state === ModalState.AchConnectAccount}
        onClose={() => setModalState({ state: ModalState.Closed })}
        onGoBack={() => handlers.goBack()}
        onSuccess={() => handlers.goBack()}
      />

      {/* Send and Receive */}
      <SendModal />

      {/* Support Modals */}
      <SupportOnlySignin />
      <CreatePublicTicket />
    </div>
  );
};
