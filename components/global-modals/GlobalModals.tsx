import { Portal } from '@headlessui/react';

import { useModalState } from '../../hooks/useModalState';
import { ModalState } from '../../lib/types/modalState';
import { ModalBackdrop } from '../base/Modal';

import ForgotPasswordModal from './authentication/ForgotPasswordModal';
import { Kyc1Required } from './authentication/Kyc1Required';
import { Kyc2Required } from './authentication/Kyc2Required';
import { SmsAuth } from './authentication/mfa/SmsAuth';
import { TotpAuth } from './authentication/mfa/TotpAuth';
import { SignIn } from './authentication/SignIn';
import SignUpModal from './authentication/SignUp';
import { ConnectBankAccount } from './deposit/ConnectBankAccount';
import DepositModal from './deposit/DepositModal';
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

      {/* Auth */}
      <SignIn />
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
    </div>
  );
};
