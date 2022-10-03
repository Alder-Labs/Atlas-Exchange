import { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/router';
import { usePlaidLink } from 'react-plaid-link';
import { useMutation } from 'react-query';

import { useBankAccounts } from '../../../hooks/useBankAccounts';
import { usePlaidLinkToken } from '../../../hooks/usePlaidLinkToken';
import { useUserState } from '../../../lib/auth-token-context';
import { BRAND_NAME } from '../../../lib/constants';
import { useMutationFetcher } from '../../../lib/mutation';
import { toast } from '../../../lib/toast';
import { Text, Button, InputCheckbox, Spinner } from '../../base';
import { SidePadding } from '../../layout/SidePadding';
import { TitledModal } from '../../modals/TitledModal';

interface ConnectBankAccountProps {
  isOpen: boolean;
  onClose: () => void;
  onGoBack: () => void;
  onSuccess: () => void;
}
export function ConnectBankAccount(props: ConnectBankAccountProps) {
  const { isOpen, onClose, onGoBack, onSuccess } = props;

  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isOpen) {
      setLoading(false);
    }
  }, [isOpen]);

  const userState = useUserState();
  const isLoggedIn = !!userState.user;

  const { bankAccountsMap, refetch: refetchBankAccounts } = useBankAccounts({
    enabled: isLoggedIn,
  });

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
      >('/proxy/api/ach/accounts', {
        onFetchSuccess: refetchBankAccounts,
      }),
      {
        onSuccess: (data) => {
          onSuccess();
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
      <TitledModal
        darkenBackground={false}
        title="Connect Bank Account"
        onGoBack={onGoBack}
        onClose={onClose}
        className="mx-auto my-8 w-full max-w-lg lg:mt-32"
        isOpen={isOpen}
      >
        <div className="px-4 py-8">
          {loading ? (
            <div className="flex w-full items-center justify-center gap-4 py-8">
              <Text>Connecting bank account...</Text>
              <Spinner />
            </div>
          ) : (
            <>
              <Text>Disclaimer:</Text>

              <div className="h-1"></div>
              <Text>
                I am linking my bank because I want to use deposited funds to
                trade cryptocurrency. Nobody else is instructing me to create an
                FTX US account or link my bank account.
              </Text>

              <div className="h-4"></div>
              <div className="flex cursor-pointer items-center gap-1.5">
                <InputCheckbox
                  label="I agree"
                  className="cursor-pointer"
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => {
                    setAgree(e.target.checked);
                  }}
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
                  {BRAND_NAME} uses Plaid and Circle to allow you to safely
                  deposit your funds from your bank account
                </Text>
              </div>
            </>
          )}
        </div>
      </TitledModal>
    </SidePadding>
  );
}
