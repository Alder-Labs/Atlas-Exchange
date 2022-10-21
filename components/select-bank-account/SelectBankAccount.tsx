import { useCallback, useState } from 'react';

import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';

import { BankAccount, useBankAccounts } from '../../hooks/useBankAccounts';
import { useModal } from '../../hooks/useModal';
import { Text, Select, TextButton } from '../base';
import { TitledModal } from '../modals/TitledModal';

import { EnterBillingInfo } from './EnterBillingInfo';
import { RenderBankAccount } from './RenderBankAccount';

interface SelectBankAccountProps {
  accountId: number | null;
  onChange: (accountId: number | null) => void;
  onClickConnect?: () => void;
}
export function SelectBankAccount(props: SelectBankAccountProps) {
  const { accountId, onChange, onClickConnect } = props;

  const router = useRouter();

  const { data: bankAccounts, hasAtLeastOneBankAccount } = useBankAccounts();
  const [open, handlers] = useModal(false);
  const [editBillingInfoAccount, setEditBillingInfoAccount] =
    useState<BankAccount | null>(null);

  const handleBillingInfoClick = useCallback(
    (account: BankAccount) => {
      handlers.open();
      setEditBillingInfoAccount(account);
    },
    [handlers]
  );

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
          return (
            <RenderBankAccount
              accountId={value}
              onBillingInfoClick={handleBillingInfoClick}
            />
          );
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
          return (
            <RenderBankAccount
              onBillingInfoClick={handleBillingInfoClick}
              accountId={value}
              selected={selected}
            />
          );
        }}
      />
      <TitledModal
        isOpen={open}
        title={'Enter billing info'}
        onClose={handlers.close}
      >
        <div className="px-6 py-8">
          {editBillingInfoAccount && (
            <EnterBillingInfo account={editBillingInfoAccount} />
          )}
        </div>
      </TitledModal>
    </div>
  );
}
