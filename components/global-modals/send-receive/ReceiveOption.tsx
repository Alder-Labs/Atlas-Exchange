import React from 'react';

import { faBan, faBitcoinSign } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';

import { Text } from '../../base';
import { MenuIconLeft, MenuIconRight } from '../../global-modals/deposit/Menu';
import { MenuItem, MenuItemProps } from '../../modals/MenuModalItem';

export const ReceiveOption = (props: {
  onClick: () => void;
  kycLevel: number;
}) => {
  const { onClick, kycLevel } = props;
  const router = useRouter();

  const kycLevel2Option = {
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

  const kycLevelOptions: MenuItemProps[] = [
    {
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
              onClick={() => {
                router.push('/account?tabIndex=1');
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
    },
    kycLevel2Option,
    kycLevel2Option,
  ];

  const itemToRender = (kycLevel: number) => {
    switch (kycLevel) {
      case 1:
        return kycLevelOptions[1];
      case 2:
        return kycLevelOptions[2];
      case 0:
      default:
        return kycLevelOptions[0];
    }
  };

  const menuItem = itemToRender(kycLevel);

  return <MenuItem {...menuItem} />;
};
