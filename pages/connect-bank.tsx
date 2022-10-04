import { useMemo, useState } from 'react';

import { useRouter } from 'next/router';
import { usePlaidLink } from 'react-plaid-link';
import { useMutation } from 'react-query';

import { InputCheckbox, Text, Button } from '../components/base';
import { SidePadding } from '../components/layout/SidePadding';
import { TitledCard } from '../components/TitledCard';
import { useBankAccounts } from '../hooks/useBankAccounts';
import { usePlaidLinkToken } from '../hooks/usePlaidLinkToken';
import { BRAND_NAME } from '../lib/constants';
import { useMutationFetcher } from '../lib/mutation';
import { toast } from '../lib/toast';

import type { NextPage } from 'next';

function ConnectABankAccount() {
  const router = useRouter();
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);

  const { refetch: refetchBankAccounts } = useBankAccounts();

  const linkTokenData = usePlaidLinkToken();

  const { isLoading: createAchAccountLoading, mutate: createAchAccount } =
    useMutation(
      useMutationFetcher<
        {
          publicToken: string;
          accountId: string;
          name: string;
          data: { mask: string; institutionName: string };
          pendingManualVerification: boolean;
        },
        {}
      >('/proxy/api/ach/accounts'),
      {
        onSuccess: (data) => {
          refetchBankAccounts().then(() => {
            router.push('/deposit/ach');
          });
          setLoading(false);
        },
        onError: (err: Error) => {
          toast.error(`Error: ${err.message}`);
          setLoading(false);
        },
      }
    );

  const { open, ready } = usePlaidLink(
    useMemo(
      () => ({
        token: linkTokenData?.link_token ?? null,
        onSuccess: (publicToken, metadata) => {
          const account = metadata.accounts[0];
          createAchAccount({
            publicToken,
            accountId: account.id,
            name: account.name,
            data: {
              mask: account.mask,
              institutionName: metadata.institution?.name ?? '',
            },
            pendingManualVerification:
              account.verification_status === 'pending_manual_verification',
          });
        },
        onExit: (err, metadata) => {
          if (err?.error_message) {
            toast.error(err.error_message);
          }
          setLoading(false);
        },
      }),
      [createAchAccount, linkTokenData?.link_token]
    )
  );

  return (
    <SidePadding>
      <TitledCard
        title="Connect a bank account"
        onGoBack={router.back}
        className="mx-auto my-8 w-full max-w-lg lg:mt-32"
      >
        <div className="px-4 py-8">
          <Text>Disclaimer:</Text>

          <div className="h-1"></div>
          <Text>
            I am linking my bank because I want to use deposited funds to trade
            cryptocurrency. Nobody else is instructing me to create an FTX US
            account or link my bank account.
          </Text>

          <div className="h-4"></div>
          <div
            className="flex cursor-pointer items-center gap-1.5"
            onClick={(e) => {
              setAgree(!agree);
            }}
          >
            <InputCheckbox
              label="I agree"
              className="cursor-pointer"
              type="checkbox"
              checked={agree}
            />
          </div>
          <div className="h-12"></div>

          <div className="text-center">
            <Button
              disabled={!agree}
              onClick={() => {
                if (ready) {
                  setLoading(true);
                  open();
                } else {
                  toast.error('Plaid link is not ready');
                }
              }}
              className="w-full"
              loading={loading}
            >
              Continue
            </Button>
            <div className="h-2"></div>
            <Text color="secondary" size="xs" className="">
              {BRAND_NAME} uses Plaid and Circle to allow you to safely deposit
              your funds from your bank account
            </Text>
          </div>
        </div>
      </TitledCard>
    </SidePadding>
  );
}

export const ConnectBankPage: NextPage = () => {
  return (
    <div className="min-h-screen bg-grayLight-20 dark:bg-black">
      <ConnectABankAccount />
    </div>
  );
};

export default ConnectBankPage;
