import React from 'react';

import { faBan, faBitcoinSign } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';

import { MfaType } from '../../../lib/types';
import { Text } from '../../base';
import { MenuIconLeft, MenuIconRight } from '../../global-modals/deposit/Menu';
import { MenuItem, MenuItemProps } from '../../modals/MenuModalItem';
import { useModalState } from '../../../hooks/useModalState';
import { ModalState } from '../../../lib/types/modalState';

export const ReceiveOption = (props: {
  onClick: () => void;
  kycLevel: number;
  mfa: MfaType;
}) => {
  const { onClick, kycLevel, mfa } = props;
  const router = useRouter();
  const [modalState, setModalState, handlers] = useModalState();

  const mfaRequiredOption = {
    title: (
      <Text className="opacity-25" size="xl">
        Receive Crypto
      </Text>
    ),
    description: (
      <>
        <Text color="secondary" className="text-start">
          Please{' '}
          <span
            className="cursor-pointer"
            onClick={async () => {
              await router.push('/account?tabIndex=0');
              setModalState({ state: ModalState.Closed });
            }}
          >
            <Text color="brand">enable 2FA</Text>
          </span>{' '}
          to receive cryptocurrency
        </Text>
      </>
    ),
    leftIcon: (
      <div className="opacity-25">
        <MenuIconLeft icon={faBitcoinSign} />
      </div>
    ),
    rightIcon: <MenuIconRight icon={faBan} />,
  };

  const kycLevelZeroOption = {
    title: (
      <Text className="opacity-25" size="xl">
        Receive Crypto
      </Text>
    ),
    description: (
      <>
        <Text color="secondary" className="text-start">
          Please{' '}
          <span
            className="cursor-pointer"
            onClick={async () => {
              await router.push('/account?tabIndex=1');
              setModalState({ state: ModalState.Closed });
            }}
          >
            <Text color="brand">verify your information</Text>
          </span>{' '}
          (Level 1) to receive cryptocurrency
        </Text>
      </>
    ),
    leftIcon: (
      <div className="opacity-25">
        <MenuIconLeft icon={faBitcoinSign} />
      </div>
    ),
    rightIcon: <MenuIconRight icon={faBan} />,
  };

  const kycLevelOneOption = {
    title: <Text size="xl"> Receive Crypto</Text>,
    description: (
      <>
        <Text color="secondary" className="text-start">
          Receive cryptocurrency. Arrival time depends on individual network
        </Text>
      </>
    ),
    leftIcon: (
      <div>
        <MenuIconLeft icon={faBitcoinSign} />
      </div>
    ),
    onClick: onClick,
  };

  const itemToRender = () => {
    if (mfa === null) {
      return mfaRequiredOption;
    }
    switch (kycLevel) {
      case 1:
      case 2:
        return kycLevelOneOption;
      case 0:
      default:
        return kycLevelZeroOption;
    }
  };

  const menuItem = itemToRender();

  return <MenuItem {...menuItem} />;
};
