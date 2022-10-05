import React from 'react';

import {
  faBuildingColumns,
  faNetworkWired,
} from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';
import { useRouter } from 'next/router';

import { AuthStatus, useAuthStatus } from '../../../hooks/useKycLevel';
import { useLoginStatus } from '../../../hooks/useLoginStatus';
import { useModalState } from '../../../hooks/useModalState';
import { useUserState } from '../../../lib/auth-token-context';
import { ModalState } from '../../../lib/types/modalState';
import { Button, Text, TextInput } from '../../base';
import { DisabledMenuItemOverlay, MenuItem } from '../../modals/MenuModalItem';
import { TitledModal } from '../../modals/TitledModal';
import { MenuIconLeft } from '../deposit/Menu';

import { WithdrawAch } from './WithdrawAch';
import WithdrawWire from './WithdrawWire';
import { WithdrawWireSuccess } from './WithdrawWireSuccess';

export const WithdrawModal = () => {
  const router = useRouter();
  const [modalState, setModalState, handlers] = useModalState();
  const { data: loginStatus, isLoading: loginStatusIsLoading } =
    useLoginStatus();

  const MenuStyle = clsx({
    'divide-y divide-grayLight-40 overflow-hidden dark:divide-grayDark-40':
      true,
  });

  const defaultModalProps = {
    onClose: () => {
      setModalState({ state: ModalState.Closed });
    },
    onGoBack: () => {
      handlers.goBack();
    },
    darkenBackground: false,
  };

  // if (modalState !== ActionModalState.Withdraw || !loginStatus?.user) {
  //   return null;
  // }
  const { authStatus } = useAuthStatus();

  return (
    <>
      <WithdrawAch />
      <TitledModal
        title="Withdraw via Wire"
        {...defaultModalProps}
        isOpen={modalState.state === ModalState.WithdrawWire}
      >
        <div className="p-6">
          <WithdrawWire
            onSuccess={() => {
              setModalState({
                state: ModalState.WithdrawWireSuccess,
              });
            }}
          />
          <div className="h-6"></div>
        </div>
      </TitledModal>
      <TitledModal
        title="Withdraw via Wire"
        {...defaultModalProps}
        isOpen={modalState.state === ModalState.WithdrawWireSuccess}
      >
        <div className="p-6">
          <WithdrawWireSuccess />
          <div className="h-6"></div>
        </div>
      </TitledModal>
      <TitledModal
        title="Withdraw"
        darkenBackground={false}
        isOpen={modalState.state === ModalState.WithdrawFiat}
        renderWhenClosed={modalState.state === ModalState.Closed}
        onClose={() => setModalState({ state: ModalState.Closed })}
      >
        <div className="divide-y divide-grayLight-40 overflow-hidden dark:divide-grayDark-40">
          <MenuItem
            title={<Text size="xl">Bank Transfer (ACH)</Text>}
            disabled={authStatus < AuthStatus.KycLevel2}
            description={
              <Text color="secondary" className="text-start">
                Withdraw via ACH. Available funds take 6 business days to
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
                  (Level 2) to <b>withdraw via ACH Bank Transfers</b>
                </Text>
              </DisabledMenuItemOverlay>
            }
            leftIcon={<MenuIconLeft icon={faBuildingColumns} />}
            onClick={() => {
              setModalState({ state: ModalState.WithdrawAch });
            }}
          />
          <MenuItem
            title={<Text size="xl">Wire Transfer</Text>}
            disabled={authStatus < AuthStatus.KycLevel2}
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
                  (Level 2) to <b>withdraw via Wire Transfers</b>
                </Text>
              </DisabledMenuItemOverlay>
            }
            leftIcon={
              <div>
                <MenuIconLeft icon={faNetworkWired} />
              </div>
            }
            onClick={() => {
              setModalState({ state: ModalState.WithdrawWire });
            }}
          />
        </div>
      </TitledModal>
    </>
  );
};
