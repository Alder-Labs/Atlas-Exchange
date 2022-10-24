import { useCallback } from 'react';

import { faCheck, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation } from 'react-query';

import {
  BankAccount,
  BankAccountStatus,
  useBankAccounts,
} from '../../hooks/useBankAccounts';
import { useModal } from '../../hooks/useModal';
import { useUserState } from '../../lib/auth-token-context';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { Text, Button, TextButton } from '../base';
import { TitledModal } from '../modals/TitledModal';
import { Tooltip } from '../Tooltip';

import { EnterBillingInfo } from './EnterBillingInfo';

interface RenderBankAccountProps {
  accountId: number;
  selected?: boolean;
  onBillingInfoClick: (account: BankAccount) => void;
}

export function RenderBankAccount(props: RenderBankAccountProps) {
  const { accountId, selected = false, onBillingInfoClick } = props;

  const { bankAccountsMap, refetch: refetchBankAccounts } = useBankAccounts();

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

  const renderStatus = useCallback(
    (account: BankAccount) => {
      if (account.needsBillingInfo) {
        return (
          <span className="ml-2 inline-block">
            <div className="flex items-center">
              <Text size="sm" className=" text-warning dark:text-warningDark">
                (Needs billing info)
              </Text>
              <Tooltip
                placement="bottom"
                content={
                  'You must enter your billing info in order to verify and use this account.'
                }
              >
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="ml-1 inline h-3 w-3 outline-none"
                />
              </Tooltip>
              <TextButton
                variant="tertiary"
                size="sm"
                className="ml-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBillingInfoClick(account);
                }}
              >
                + Add billing info
              </TextButton>
            </div>
          </span>
        );
      }

      switch (account.status) {
        case BankAccountStatus.REQUESTED:
        case BankAccountStatus.NEEDS_DEPOSIT_VERIFICATION:
        case BankAccountStatus.PENDING_PLAID_VERIFICATION:
          return (
            <span>
              <Text color="warning" className="ml-2" size="sm">
                (Pending Verification)
              </Text>
              <Tooltip
                placement="bottom"
                content={
                  'Your bank account is pending verification from Plaid.'
                }
              >
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="ml-1 inline h-3 w-3 outline-none"
                />
              </Tooltip>
            </span>
          );
        case BankAccountStatus.REJECTED:
          return (
            <span>
              <Text color="error" className="ml-2" size="sm">
                (Rejected)
              </Text>
              <Tooltip
                placement="bottom"
                content={'Your bank account has been rejected from Plaid.'}
              >
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="ml-1 inline h-3 w-3 outline-none"
                />
              </Tooltip>
            </span>
          );
        case BankAccountStatus.APPROVED:
        default:
          return <></>;
      }
    },
    [onBillingInfoClick]
  );

  const account = bankAccountsMap?.[accountId];
  if (!account) {
    return null;
  }

  const needsBillingInfo = true;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <Text className="flex items-center">
          {account?.name}
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
        <Text size="sm" color="secondary" className="whitespace-nowrap">
          {account?.identity.mask}
          {renderStatus(account)}
        </Text>
      </div>
      {selected && <FontAwesomeIcon icon={faCheck} className="mr-2 h-4 w-4" />}
    </div>
  );
}
