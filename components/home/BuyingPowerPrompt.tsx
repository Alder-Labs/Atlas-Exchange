import React from 'react';

import clsx from 'clsx';

import { useModalState } from '../../hooks/useModalState';
import { renderCurrency } from '../../lib/currency';
import { ModalState } from '../../lib/types/modalState';
import { Button, Text } from '../base';

interface BuyingPowerPromptProps extends React.HTMLAttributes<HTMLDivElement> {
  amount: number;
}

export const BuyingPowerPrompt = ({
  className,
  amount,
}: BuyingPowerPromptProps) => {
  const [modalState, setModalState] = useModalState();

  return (
    <div className={clsx('', className)}>
      <div className="flex flex-col">
        <Text color={'secondary'}>Buying Power</Text>
        <Text size="4xl" weight="medium">
          {renderCurrency({
            amount,
            coinId: 'USD',
            showCoinId: false,
            roundingMode: 'floor',
          })}
        </Text>
      </div>
      <div className="h-6"></div>
      <Button
        variant="outline-gray"
        onClick={() => {
          setModalState({ state: ModalState.DepositFiat });
        }}
      >
        Add Funds
      </Button>
    </div>
  );
};
