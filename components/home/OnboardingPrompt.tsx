import React from 'react';

import clsx from 'clsx';
import { useRouter } from 'next/router';

import { Button, Title, Text } from '../base';

export const OnboardingPrompt = ({
  className,
}: React.HTMLAttributes<HTMLDivElement>) => {
  const router = useRouter();
  return (
    <div className={clsx('', className)}>
      <Title order={4} className="font-bold">
        Start your onboarding process
      </Title>
      <div className="h-2"></div>
      <Text size="md" color="secondary">
        Verify your identity to begin trading
      </Text>
      <div className="h-6"></div>
      <Button onClick={() => router.push('/onboarding')}>
        Verify Identity
      </Button>
    </div>
  );
};
