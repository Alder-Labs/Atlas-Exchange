import React from 'react';

import {
  faBuildingColumns,
  faNetworkWired,
} from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';

import { AuthStatus, useAuthStatus } from '../../../hooks/useKycLevel';
import { useModalState } from '../../../hooks/useModalState';
import { ModalState } from '../../../lib/types/modalState';
import { Text } from '../../base';
import { DisabledMenuItemOverlay, MenuItem } from '../../modals/MenuModalItem';
import { TitledModal } from '../../modals/TitledModal';

import { EnterAmount } from './EnterAmount';
import { MenuIconLeft } from './Menu';
import DepositWire, { DepositWireConfirm } from './Wire';

const DepositModal = () => {
  const router = useRouter();
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

  const { authStatus } = useAuthStatus();

  return (
    <>
      <EnterAmount
        onClose={() => setModalState({ state: ModalState.Closed })}
        onClickConnect={() =>
          setModalState({ state: ModalState.AchConnectAccount })
        }
      />

      <TitledModal
        title="Deposit via Wire"
        {...defaultModalProps}
        isOpen={modalState.state === ModalState.DepositWire}
      >
        <div className="p-6">
          <DepositWire />
          <div className="h-6" />
        </div>
      </TitledModal>
      <TitledModal
        title="Deposit via Wire"
        {...defaultModalProps}
        isOpen={modalState.state === ModalState.DepositWireConfirm}
      >
        <div className="p-6">
          <DepositWireConfirm />
        </div>
      </TitledModal>
      <TitledModal
        title="Deposit"
        darkenBackground={false}
        isOpen={modalState.state === ModalState.DepositFiat}
        renderWhenClosed={modalState.state === ModalState.Closed}
        onClose={() => setModalState({ state: ModalState.Closed })}
      >
        <div className="divide-y divide-grayLight-40 overflow-hidden dark:divide-grayDark-40">
          <MenuItem
            title={<Text size="xl">Bank Transfer (ACH)</Text>}
            subtitle={'$2000 limit per transaction'}
            disabled={authStatus < AuthStatus.KycLevel1}
            description={
              <Text color="secondary" className="text-start">
                Transfers via ACH are free if you deposit more than $100 or
                $0.50 for standard fee. Available funds take 6 business days to
                arrive.
              </Text>
            }
            disabledDescription={
              <DisabledMenuItemOverlay>
                <Text color="secondary" className="text-start">
                  Please{' '}
                  <span
                    className="cursor-pointer hover:brightness-110"
                    onClick={async () => {
                      await router.push('/account?tabIndex=1');
                      setModalState({ state: ModalState.Closed });
                    }}
                  >
                    <Text color="brand" weight="bold">
                      verify your information
                    </Text>
                  </span>{' '}
                  (Level 2) to use <b>ACH Bank Transfers</b>
                </Text>
              </DisabledMenuItemOverlay>
            }
            leftIcon={<MenuIconLeft icon={faBuildingColumns} />}
            onClick={() => {
              setModalState({ state: ModalState.DepositAch });
            }}
          />
          <MenuItem
            title={<Text size="xl">Wire Transfer</Text>}
            disabled={authStatus < AuthStatus.KycLevel1}
            description={
              <Text color="secondary" className="text-start">
                Each transfer is $10. Funds will typically arrive within 1
                business day after arrival at bank
              </Text>
            }
            disabledDescription={
              <DisabledMenuItemOverlay>
                <Text color="secondary" className="text-start">
                  Please{' '}
                  <span
                    className="cursor-pointer hover:brightness-110"
                    onClick={async () => {
                      await router.push('/account?tabIndex=1');
                      setModalState({ state: ModalState.Closed });
                    }}
                  >
                    <Text color="brand" weight="bold">
                      verify your information
                    </Text>
                  </span>{' '}
                  (Level 2) to use <b>Wire Transfers</b>
                </Text>
              </DisabledMenuItemOverlay>
            }
            leftIcon={
              <div>
                <MenuIconLeft icon={faNetworkWired} />
              </div>
            }
            onClick={() => {
              setModalState({ state: ModalState.DepositWire });
            }}
          />
        </div>
      </TitledModal>
    </>
  );
};

export default DepositModal;
