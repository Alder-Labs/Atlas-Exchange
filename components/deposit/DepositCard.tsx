import React from 'react';

import { SidePadding } from '../../components/layout/SidePadding';
import { TitledCard } from '../../components/TitledCard';

interface DepositCardProps {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
}

export const DepositCard = (props: DepositCardProps) => {
  const { title, children, onBack } = props;

  return (
    <div className="grow bg-grayLight-20 dark:bg-black">
      <SidePadding>
        <TitledCard
          onGoBack={onBack}
          className="mx-auto my-8 w-full max-w-lg lg:my-32"
          title={title}
        >
          {children}
        </TitledCard>
      </SidePadding>
    </div>
  );
};
