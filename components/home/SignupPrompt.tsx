import React from 'react';

import clsx from 'clsx';

import { useModalState } from '../../hooks/modal';
import { ModalState } from '../../lib/types/modalState';
import { Button, Text, Title } from '../base';

export const SignupPrompt = ({
  className,
}: React.HTMLAttributes<HTMLDivElement>) => {
  const [modalState, setModalState] = useModalState();
  return (
    <div className={clsx('', className)}>
      <Title order={4} className="font-bold">
        Sign up today
      </Title>
      <div className="h-2"></div>
      <Text size="md" color="secondary">
        Sign up now to start trading
      </Text>
      <div className="h-6"></div>
      <Button onClick={() => setModalState({ state: ModalState.SignUp })}>
        Sign Up
      </Button>
    </div>
  );
};
