import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';

import { useBankAccounts } from '../hooks/useBankAccounts';
import { useUserState } from '../lib/auth-token-context';
import { useMutationFetcher } from '../lib/mutation';
import { toast } from '../lib/toast';

import { Text, Button, Select, TextButton } from './base';

interface RenderBankAccountProps {
  accountId: number;
  selected?: boolean;
}

function RenderBankAccount(props: RenderBankAccountProps) {
  const { accountId, selected = false } = props;

  const userState = useUserState();
  const isLoggedIn = !!userState.user;

  const { bankAccountsMap, refetch: refetchBankAccounts } = useBankAccounts({
    enabled: isLoggedIn,
  });

  const { isLoading: loadingDeleteAchAccount, mutateAsync: deleteAchAccount } =
    useMutation(
      useMutationFetcher(`/proxy/api/ach/accounts/${accountId}`, {
        method: 'DELETE',
        onFetchSuccess: refetchBankAccounts,
      }),
      {
        onSuccess: () => {
          toast.success('Bank account deleted.');
        },
      }
    );

  const account = bankAccountsMap?.[accountId];

  if (!account) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <Text className="flex items-center">
          {account?.name}
          {account?.status === 'rejected' && (
            <>
              <Text color="error" className="ml-2">
                ({account.status})
              </Text>
            </>
          )}
          {account && (
            <Button
              size="xs"
              variant="secondary"
              className="ml-3"
              loading={loadingDeleteAchAccount}
              onClick={(e) => {
                e.preventDefault();
                if (
                  window.confirm(
                    'Are you sure you want to delete this account?'
                  )
                ) {
                  deleteAchAccount(account.id);
                }
              }}
            >
              Delete
            </Button>
          )}
        </Text>
        <Text size="sm" color="secondary">
          {account?.identity.mask}
        </Text>
      </div>
      {selected && <FontAwesomeIcon icon={faCheck} className="mr-2 h-4 w-4" />}
    </div>
  );
}

interface SelectBankAccountProps {
  accountId: number | null;
  onChange: (accountId: number | null) => void;
  onClickConnect?: () => void;
}
export function SelectBankAccount(props: SelectBankAccountProps) {
  const { accountId, onChange, onClickConnect } = props;

  const router = useRouter();

  const { data: bankAccounts, hasAtLeastOneBankAccount } = useBankAccounts();

  return (
    <div>
      <div className="flex justify-between">
        <label className="block text-sm font-medium text-black dark:text-grayDark-80">
          Select an account
        </label>
        <TextButton
          size="sm"
          className="font-medium"
          type="button"
          onClick={() => {
            if (onClickConnect) {
              onClickConnect();
            } else {
              router.push('/connect-bank');
            }
          }}
        >
          + Add an account
        </TextButton>
      </div>
      <div className="h-1"></div>
      <Select
        hideSelectedFromList
        className="w-full"
        value={accountId}
        options={
          bankAccounts?.map((account) => ({
            value: account.id,
            label: `${account.name} ${account.identity.mask}`,
          })) ?? []
        }
        onSelect={onChange}
        renderSelected={(value) => {
          return <RenderBankAccount accountId={value} />;
        }}
        renderPlaceholder={() => {
          return (
            <div className="relative">
              <div className="pointer-events-none flex justify-between opacity-0">
                <div className="flex flex-col">
                  <Text>placeholder</Text>
                  <Text size="sm" color="secondary">
                    placeholder
                  </Text>
                </div>
              </div>
              <div className="absolute top-0 left-0 flex h-full items-center justify-between">
                {hasAtLeastOneBankAccount ? (
                  <Text color="secondary" className="whitespace-nowrap">
                    None selected
                  </Text>
                ) : (
                  <Text color="secondary" className="whitespace-nowrap">
                    No bank accounts
                  </Text>
                )}
              </div>
            </div>
          );
        }}
        renderOption={(value, { selected }) => {
          return <RenderBankAccount accountId={value} selected={selected} />;
        }}
      />
    </div>
  );
}
