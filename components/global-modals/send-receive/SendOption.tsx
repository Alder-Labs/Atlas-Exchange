import React from 'react';

import { faBan, faBitcoinSign } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';

import { useModalState } from '../../../hooks/modal';
import { MfaType } from '../../../lib/types';
import { ModalState } from '../../../lib/types/modalState';
import { Text } from '../../base';
import { MenuIconLeft, MenuIconRight } from '../../global-modals/deposit/Menu';
import { MenuItem } from '../../modals/MenuModalItem';
import { useUserState } from '../../../lib/auth-token-context';
import { UserStateStatus } from '../../../lib/types/user-states';
import { useWithdrawalLimits } from '../../../hooks/transfer';
import { renderCurrency } from '../../../lib/currency';

export const SendOption = (props: {
  onClick: () => void;
  kycLevel: number;
  mfa: MfaType;
}) => {
  const { onClick, kycLevel, mfa } = props;
  const router = useRouter();

  const [modalState, setModalState, handlers] = useModalState();

  const userState = useUserState();
  const hasWithdrawalLimits =
    userState.status === UserStateStatus.SIGNED_IN &&
    userState.loginStatusData.user?.kycLevel === 1;

  const { data: withdrawalLimits, isLoading: limitsLoading } =
    useWithdrawalLimits({ enabled: hasWithdrawalLimits });

  const mfaRequiredOption = {
    title: (
      <Text className="opacity-25" size="xl">
        Send Crypto
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
          to send cryptocurrency
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
        Send Crypto
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
          (Level 1) to send cryptocurrency
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

  const kycLevelTwoOption = {
    title: <Text size="xl">Send Crypto</Text>,
    description: (
      <>
        <Text color="secondary" className="text-start">
          Send cryptocurrency. Arrival time depends on individual network
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

  const limitPerDay = renderCurrency({
    amount: withdrawalLimits?.threshold ?? 0,
    coinId: 'USD',
  });

  const kycLevelOneOption = {
    ...kycLevelTwoOption,
    subtitle: `${limitPerDay} limit per day`,
    description: (
      <>
        <Text color="secondary" className="text-start">
          Send cryptocurrency. Arrival time depends on individual network.
          <div>
            <span
              className="cursor-pointer"
              onClick={async () => {
                await router.push('/account?tabIndex=1');
                setModalState({ state: ModalState.Closed });
              }}
            >
              <Text color="brand">
                Complete identity verification (level 2)
              </Text>
            </span>{' '}
            to waiver the daily limit.
          </div>
        </Text>
      </>
    ),
  };

  const itemToRender = () => {
    if (mfa === null) {
      return mfaRequiredOption;
    }
    switch (kycLevel) {
      case 1:
        return kycLevelOneOption;
      case 2:
        return kycLevelTwoOption;
      case 0:
      default:
        return kycLevelZeroOption;
    }
  };

  const menuItem = itemToRender();

  return <MenuItem {...menuItem} />;
};
