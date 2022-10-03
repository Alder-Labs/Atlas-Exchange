import { useMemo } from 'react';

import Link from 'next/link';

import { useModalState } from '../../hooks/useModalState';
import { ModalState } from '../../lib/types/modalState';
import { TextButton, Text } from '../base';

import { getTradeError } from './trade-errors';

interface TradeErrorProps {
  error?: Error;
  fromCoinId: string;
  toCoinId: string;
  type: 'buy' | 'sell' | 'convert';
}

export function TradeError(props: TradeErrorProps) {
  const { error, toCoinId, fromCoinId, type } = props;

  const tradeError = useMemo(() => {
    if (!error) return null;
    return getTradeError(error);
  }, [error]);

  const [modalState, setModalState] = useModalState();

  if (!tradeError) return null;

  switch (tradeError.type) {
    case 'not-enough-funds':
      if (type === 'buy') {
        return (
          <div className="dark:bg-grayDark-20 bg-grayLight-20 mb-2 flex w-full flex-col items-center rounded-md p-4">
            <Text size="sm">Not enough funds.</Text>
            <div className="h-1"></div>

            <TextButton
              onClick={() => {
                setModalState({
                  state: ModalState.DepositAch,
                  title: 'Add Buying Power',
                  showBackButton: false,
                });
              }}
              size="xs"
            >
              Add buying power
            </TextButton>
          </div>
        );
      } else {
        return (
          <div className="dark:bg-grayDark-20 bg-grayLight-20 mb-2 flex w-full flex-col items-center rounded-md p-4">
            <Text size="sm">Not enough {fromCoinId}.</Text>
          </div>
        );
      }
    case 'not-logged-in':
      return (
        <div className="dark:bg-grayDark-20 bg-grayLight-20 mb-2 flex w-full flex-col items-center rounded-md p-4">
          <Text size="sm">Sign in to buy {toCoinId}.</Text>
          <div className="h-1"></div>
          <Link href="/signin">
            <TextButton size="xs">Sign in</TextButton>
          </Link>
        </div>
      );
    case 'needs-mfa':
      return (
        <div className="dark:bg-grayDark-20 bg-grayLight-20 mb-2 flex w-full flex-col items-center rounded-md p-4">
          <Text size="sm">Enable MFA in order to trade.</Text>
          <div className="h-1"></div>
          <Link href="/account">
            <TextButton size="xs">Go to account settings</TextButton>
          </Link>
        </div>
      );
    case 'needs-kyc-2':
      return (
        <div className="dark:bg-grayDark-20 bg-grayLight-20 mb-2 flex w-full flex-col items-center rounded-md p-4">
          <Text size="sm">Needs KYC Level 2.</Text>
          <div className="h-1"></div>
          <Link href="/account?tabIndex=1">
            <TextButton size="xs">Verify account</TextButton>
          </Link>
        </div>
      );
    default:
      return (
        <div className="dark:bg-grayDark-20 bg-grayLight-20 mb-2 flex w-full flex-col items-center rounded-md p-4">
          <Text size="sm">{tradeError?.message ?? 'Unknown error'}</Text>
        </div>
      );
  }
}
