import { useEffect, useState } from 'react';

import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import { Rifm } from 'rifm';

import { useBalances } from '../../../hooks/useBalances';
import { useBankAccounts } from '../../../hooks/useBankAccounts';
import { useDepositLimits } from '../../../hooks/useDepositLimits';
import { useModal } from '../../../hooks/useModal';
import { useModalState } from '../../../hooks/useModalState';
import { useUserState } from '../../../lib/auth-token-context';
import { BRAND_NAME } from '../../../lib/constants';
import { renderCurrency } from '../../../lib/currency';
import { watchBalanceUntilAtom } from '../../../lib/jotai';
import { useMutationFetcher } from '../../../lib/mutation';
import { toast } from '../../../lib/toast';
import { CustomPage } from '../../../lib/types';
import { AuthLevel } from '../../../lib/types/auth-level';
import { ModalState } from '../../../lib/types/modalState';
import { Text, TextInput, Button, TextButton } from '../../base';
import { SidePadding } from '../../layout/SidePadding';
import { TitledModal } from '../../modals/TitledModal';
import { SelectBankAccount } from '../../SelectBankAccount';
import { TitledCard } from '../../TitledCard';
import { BigNumberInput } from '../../trade/BigNumberInput';

interface EnterAmountProps {
  onClose: () => void;
  onClickConnect: () => void;
}

export function EnterAmount(props: EnterAmountProps) {
  const { onClose, onClickConnect } = props;

  const [state, setModalState] = useModalState();

  const userState = useUserState();

  const { data: bankAccounts } = useBankAccounts();
  const { data: depositLimits } = useDepositLimits();
  const { refetch: refetchBalances } = useBalances();
  const [_, setWatchBalanceUntil] = useAtom(watchBalanceUntilAtom);

  const limit = depositLimits
    ? depositLimits.achDepositLimit - depositLimits.achRecentlyDeposited
    : 0;

  const [accountId, setAccountId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (bankAccounts) {
      if (bankAccounts.length > 0) {
        setAccountId(bankAccounts[0].id);
      }
    }
  }, [bankAccounts]);

  const { isLoading: loadingRequestAchDeposit, mutate: requestAchDeposit } =
    useMutation(
      useMutationFetcher<
        {
          coin: string;
          size: string;
          achAccountId: string;
        },
        {}
      >('/proxy/api/wallet/circle_ach_deposit', {}),
      {
        onError: (err: Error) => {
          toast.error(`Error: ${err.message}`);
        },
        onSuccess: () => {
          // Watch balance for the next 10 seconds
          setWatchBalanceUntil(Date.now() + 1000 * 10);
          setModalState({
            state: ModalState.DepositAchSuccess,
          });
        },
      }
    );

  const modalTitle =
    state.state === ModalState.DepositAch && state.title
      ? state.title
      : 'Deposit';
  const showBackButton =
    state.state === ModalState.DepositAch && state.showBackButton === false
      ? false
      : true;

  return (
    <div className="">
      <TitledModal
        isOpen={state.state === ModalState.DepositAchSuccess}
        onClose={() => {
          onClose();
        }}
        title="Deposit Successful"
        darkenBackground={false}
      >
        <div className="flex flex-col items-center px-6 py-8">
          <Text size="2xl" className="text-center">
            Instantly trade with{' '}
            <Text color="brand" size="2xl">
              {renderCurrency({ amount: amount, coinId: 'USD' })}
            </Text>
          </Text>
          <div className="h-4"></div>
          <div className="text-left">
            <Text>Funds will be available within a few seconds. </Text>
            <div className="h-2"></div>
            <Text>
              {renderCurrency({ amount: amount, coinId: 'USD' })} will be
              deducted from your bank account within 5 business days. Please
              make sure to have at least{' '}
              {renderCurrency({ amount: amount, coinId: 'USD' })} in your bank
              account until then.
            </Text>
          </div>
          <div className="h-6"></div>
          <Button
            onClick={() => {
              onClose();
            }}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </TitledModal>

      <TitledModal
        title={modalTitle}
        onClose={onClose}
        isOpen={state.state === ModalState.DepositAch}
        darkenBackground={false}
        renderWhenClosed={state.state === ModalState.Closed}
        onGoBack={
          showBackButton
            ? () => {
                setModalState({ state: ModalState.DepositFiat });
              }
            : undefined
        }
      >
        <div className="px-6 pb-8">
          <div className="h-4"></div>
          <div>
            <div className="flex justify-center rounded-md border p-1 dark:border-grayDark-40">
              <BigNumberInput
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === ',') {
                    e.preventDefault();
                  }
                }}
                placeholder="0.00"
                //   renderPrefix={() => (
                //     <div className="ml-3">
                //       <Text>$</Text>
                //     </div>
                //   )}
                coinId="USD"
                value={amount}
                onValueChange={(newVal) => {
                  setAmount(newVal);
                }}
              />
            </div>

            <div className="h-4"></div>
            <SelectBankAccount
              onClickConnect={onClickConnect}
              accountId={accountId}
              onChange={(accountId) => {
                setAccountId(accountId);
              }}
            />

            {parseFloat(amount) > limit && (
              <Text color="warning" size="sm">
                Current ach deposit limit of ${limit} exceeded. Please reduce
                your amount.
              </Text>
            )}

            <div className="h-6"></div>

            <div className="flex justify-between">
              <Text color="secondary">External processing fees</Text>
              <Text>Free</Text>
            </div>
            <div className="h-2"></div>
            <div className="flex justify-between">
              <Text color="secondary">Withdrawable</Text>
              <Text>12 business days</Text>
            </div>
            <div className="h-4"></div>

            <Text size="xs" color="secondary">
              By submitting, I authorize Circle Internet Financial, on behalf of{' '}
              {BRAND_NAME}, to electronically debit my account (and, if
              necessary, electronically credit my account) at the financial
              institution indicated by me. I understand that this authorization
              will remain in full force and effect until I notify {BRAND_NAME}{' '}
              that I wish to revoke this authorization. I agree that ACH
              transactions I authorize comply with all applicable law.
            </Text>
            <div className="h-4"></div>
            <Button
              className="w-full"
              loading={loadingRequestAchDeposit}
              disabled={!amount || !accountId || parseFloat(amount) === 0}
              onClick={() => {
                if (accountId === null) {
                  toast.error('Please select an account');
                  return;
                }
                if (!amount) {
                  toast.error('Please enter an amount');
                  return;
                }
                requestAchDeposit({
                  coin: 'USD',
                  size: amount,
                  achAccountId: accountId.toString(),
                });
              }}
            >
              Deposit
            </Button>
            <div className="h-2"></div>
            <Text color="secondary" size="xs">
              {BRAND_NAME} uses Plaid and Circle to allow you to safely and
              securely deposit funds from your bank account.
            </Text>
          </div>
        </div>
      </TitledModal>
    </div>
  );
}
