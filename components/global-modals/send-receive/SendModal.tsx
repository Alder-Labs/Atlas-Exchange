import React from 'react';

import clsx from 'clsx';
import { useRouter } from 'next/router';

import { useCoins } from '../../../hooks/market';
import { useModalState } from '../../../hooks/modal';
import { useUserState } from '../../../lib/auth-token-context';
import { ModalState } from '../../../lib/types/modalState';
import { Button, Text } from '../../base';
import CryptoSelectMenu from '../../deposit/CryptoSelectMenu';
import { TitledModal } from '../../modals/TitledModal';

import CryptoDepositAddress from './CryptoDepositAddress';
import { ReceiveOption } from './ReceiveOption';
import { SendOption } from './SendOption';
import WithdrawCryptoConfirm from './WithdrawCryptoConfirm';
import WithdrawCryptoForm from './WithdrawCryptoForm';

const SendModal = () => {
  const router = useRouter();
  const userState = useUserState();
  const [modalState, setModalState, handlers] = useModalState();
  const { coinsMap, isLoading } = useCoins({
    refetchOnWindowFocus: false,
  });

  const MenuStyle = clsx({
    'divide-y divide-grayLight-40 overflow-hidden dark:divide-grayDark-40':
      true,
  });

  const baseStateModalProps = {
    onClose: () => {
      setModalState({ state: ModalState.Closed });
    },
  };

  const defaultModalProps = {
    onClose: () => {
      setModalState({ state: ModalState.Closed });
    },
    onGoBack: () => {
      handlers.goBack();
    },
  };

  const kycLevel = userState.loginStatusData?.user?.kycLevel;
  const mfa = userState.loginStatusData?.mfa;

  if (!kycLevel || !mfa) {
    return null;
  }

  return (
    <>
      <TitledModal
        title="Send Successful"
        {...defaultModalProps}
        isOpen={modalState.state === ModalState.SendCryptoSuccess}
        darkenBackground={false}
      >
        <div className="p-3 lg:p-6">
          <Text>Go to your wallet to view your updated balance.</Text>
          <div className="h-6"></div>
          <Button
            onClick={async () => {
              await router.push('/wallet');
              setModalState({ state: ModalState.Closed });
            }}
            className="w-full"
          >
            View Wallet
          </Button>
        </div>
      </TitledModal>

      <TitledModal
        title="Send Crypto"
        {...defaultModalProps}
        isOpen={modalState.state === ModalState.SendCryptoConfirm}
        darkenBackground={false}
      >
        <div className="p-3 lg:p-6">
          {modalState.state === ModalState.SendCryptoConfirm && (
            <WithdrawCryptoConfirm
              coin={modalState.coin}
              input={modalState.data}
              onCancel={router.back}
              onSuccess={() => {
                setModalState({ state: ModalState.SendCryptoSuccess });
              }}
            />
          )}
        </div>
      </TitledModal>

      <TitledModal
        title="Send Crypto"
        {...defaultModalProps}
        isOpen={modalState.state === ModalState.SendCryptoForm}
        onGoBack={() => {
          setModalState({
            state: ModalState.SendCryptoSelect,
          });
        }}
        darkenBackground={false}
      >
        <div className="p-3 lg:p-6">
          {modalState.state === ModalState.SendCryptoForm &&
            coinsMap?.[modalState.coinId ?? ''] && (
              <WithdrawCryptoForm
                buttonText="Preview Send"
                coin={coinsMap?.[modalState.coinId ?? '']}
                onCancel={router.back}
                onSuccess={(data) => {
                  setModalState({
                    state: ModalState.SendCryptoConfirm,
                    ...data,
                  });
                }}
              />
            )}
        </div>
      </TitledModal>

      <TitledModal
        title="Send Crypto"
        {...defaultModalProps}
        isOpen={modalState.state === ModalState.SendCryptoSelect}
        onGoBack={() => {
          setModalState({
            state: ModalState.SendReceiveCrypto,
          });
        }}
        darkenBackground={false}
      >
        <div className="p-3 lg:p-6">
          <CryptoSelectMenu
            onSelectCoinId={(coinId: string) => {
              setModalState({ state: ModalState.SendCryptoForm, coinId });
            }}
            filter={(coin) => !coin.fiat && coin.canWithdraw}
          />
        </div>
      </TitledModal>

      <TitledModal
        title="Receive Crypto"
        {...defaultModalProps}
        isOpen={modalState.state === ModalState.ReceiveCryptoAddress}
        darkenBackground={false}
        onGoBack={() => {
          setModalState({ state: ModalState.ReceiveCryptoSelect });
        }}
      >
        <div className="p-3 lg:p-6">
          {modalState.state === ModalState.ReceiveCryptoAddress &&
            coinsMap?.[modalState.coinId ?? ''] && (
              <CryptoDepositAddress
                coin={coinsMap?.[modalState.coinId ?? '']}
              />
            )}
        </div>
      </TitledModal>

      <TitledModal
        title="Receive Crypto"
        {...defaultModalProps}
        isOpen={modalState.state === ModalState.ReceiveCryptoSelect}
        onGoBack={() => {
          setModalState({ state: ModalState.SendReceiveCrypto });
        }}
        darkenBackground={false}
      >
        <div className="p-3 lg:p-6">
          <CryptoSelectMenu
            onSelectCoinId={(coinId: string) => {
              setModalState({ state: ModalState.ReceiveCryptoAddress, coinId });
            }}
            filter={(coin) => !coin.fiat && coin.canDeposit}
          />
        </div>
      </TitledModal>

      <TitledModal
        title="Send and Receive"
        {...baseStateModalProps}
        isOpen={modalState.state === ModalState.SendReceiveCrypto}
        darkenBackground={false}
        renderWhenClosed={modalState.state === ModalState.Closed}
      >
        <div className={MenuStyle}>
          <ReceiveOption
            mfa={mfa}
            kycLevel={kycLevel}
            onClick={() => {
              setModalState({ state: ModalState.ReceiveCryptoSelect });
            }}
          />
          <SendOption
            mfa={mfa}
            kycLevel={kycLevel}
            onClick={() => {
              setModalState({ state: ModalState.SendCryptoSelect });
            }}
          />
        </div>
      </TitledModal>
    </>
  );
};

export default SendModal;
