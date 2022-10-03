import { useRouter } from 'next/router';

import { Button, Text } from '../../base';

export const WithdrawWireSuccess = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <Text size="2xl">Your withdraw has been initiated!</Text>
      <div className="h-4" />
      <Text color="secondary">
        Your wire request has been successfully initiated. Funds should be
        received in a couple of business days.
      </Text>
      <div className="h-6" />
      <Button
        className="w-full"
        onClick={() => {
          router.push('/wallet');
        }}
      >
        <div className="w-full">Continue to Wallet</div>
      </Button>
    </div>
  );
};
