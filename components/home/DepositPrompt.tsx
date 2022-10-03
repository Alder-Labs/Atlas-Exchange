import React from 'react';

import clsx from 'clsx';
import { useRouter } from 'next/router';

import { Button, Text, Title } from '../base';
import { ModalState } from '../../lib/types/modalState';
import { useModalState } from '../../hooks/useModalState';

export const DepositPrompt = ({
  className,
}: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();
  const [modalState, setModalState] = useModalState();
  return (
    <div className={clsx('', className)}>
      <Title order={4} className="font-bold">
        Deposit funds to start trading
      </Title>
      <div className="h-2"></div>
      <Text size="md" color="secondary">
        Deposit your preferred currency to start trading crypto
      </Text>
      <div className="h-6"></div>
      <Button onClick={() => setModalState({ state: ModalState.DepositFiat })}>
        Deposit
      </Button>
    </div>
  );
};
