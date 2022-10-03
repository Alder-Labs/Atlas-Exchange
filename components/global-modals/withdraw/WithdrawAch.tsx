import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import { Rifm } from 'rifm';

import { useBalances } from '../../../hooks/useBalances';
import { useBankAccounts } from '../../../hooks/useBankAccounts';
import { useModalState } from '../../../hooks/useModalState';
import { useUserState } from '../../../lib/auth-token-context';
import { renderCurrency } from '../../../lib/currency';
import { useMutationFetcher } from '../../../lib/mutation';
import { toast } from '../../../lib/toast';
import { ModalState } from '../../../lib/types/modalState';
import { Button, Text, TextInput } from '../../base';
import { TitledModal } from '../../modals/TitledModal';
import { SelectBankAccount } from '../../SelectBankAccount';

const COIN_ID = 'USD';

const numberAccept = /[\d.]+/g;

interface WithdrawAchInput {
  coin: string;
  size: string;
  achAccountId: number;
}

function addCommas(nStr: string) {
  nStr += '';
  let x = nStr.replace(/[^\d.]/g, '').split('.');
  let x1 = x[0];
  let x2 = x.length > 1 ? '.' + x[1] : '';
  let rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2.slice(0, 3);
}

export function WithdrawAch() {
  const userState = useUserState();
  const isLoggedIn = !!userState.user;

  const { data: bankAccounts } = useBankAccounts({
    enabled: isLoggedIn,
  });

  const { balancesMap, isLoading: loadingBalances } = useBalances({
    enabled: isLoggedIn,
  });

  const [accountId, setAccountId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');

  const [modalState, setModalState] = useModalState();
  const router = useRouter();

  useEffect(() => {
    if (bankAccounts) {
      if (bankAccounts.length > 0) {
        setAccountId(bankAccounts[0].id);
      }
    }
  }, [bankAccounts]);

  const { isLoading: loadingRequestAchWithdraw, mutate: requestAchWithdraw } =
    useMutation(
      useMutationFetcher<WithdrawAchInput, {}>(
        '/proxy/api/wallet/circle_ach_withdrawals'
      ),
      {
        onSuccess: () => {
          setModalState({ state: ModalState.WithdrawAchSuccess });
        },
        onError: (err: Error) => {
          toast.error(`Error: ${err.message}`);
        },
      }
    );

  return (
    <>
      <TitledModal
        isOpen={modalState.state === ModalState.WithdrawAchSuccess}
        onClose={() => {
          setModalState({ state: ModalState.Closed });
        }}
        title="Withdraw initiated successfully"
        darkenBackground={false}
      >
        <div className="flex flex-col items-center px-6 py-8">
          <Text>
            Go to your wallet to view your updated balance and withdrawals
            records. Funds will be deposited into your bank account within 3-4
            business days.
          </Text>
          <div className="h-6"></div>
          <Button
            onClick={async () => {
              await router.push('/wallet?tab=Withdrawals');
              setModalState({ state: ModalState.Closed });
            }}
            className="w-full"
          >
            View Wallet
          </Button>
        </div>
      </TitledModal>

      <TitledModal
        title="Withdraw (ACH)"
        onClose={() => {
          setModalState({ state: ModalState.Closed });
        }}
        isOpen={modalState.state === ModalState.WithdrawAch}
        darkenBackground={false}
        renderWhenClosed={modalState.state === ModalState.Closed}
        onGoBack={() => {
          setModalState({ state: ModalState.WithdrawFiat });
        }}
      >
        <div className="px-6 py-8">
          <SelectBankAccount
            accountId={accountId}
            onChange={(accountId) => {
              setAccountId(accountId);
            }}
          />
          <div className="h-4"></div>
          <Rifm
            accept={numberAccept}
            format={addCommas}
            value={amount}
            onChange={(val) => {
              const stripped = val.replace(/[^\d.]/g, '');
              setAmount(stripped);
            }}
          >
            {({ value, onChange }) => (
              <TextInput
                className="w-full"
                label={`Amount (${COIN_ID})`}
                onKeyDown={(e) => {
                  if (e.key === ',') {
                    e.preventDefault();
                  }
                }}
                renderPrefix={() => (
                  <div className="ml-3">
                    <Text>$</Text>
                  </div>
                )}
                value={value}
                onChange={(e) => {
                  const stripped = e.target.value.replace(/[^\d.]/g, '');
                  const [head] = stripped.split('.');
                  if (head.length < 16) {
                    onChange(e);
                  }
                }}
              />
            )}
          </Rifm>
          <div className="h-0.5" />
          <Text
            color="secondary"
            size="sm"
            isLoading={loadingBalances}
            loadingWidth="4rem"
          >
            Balance:{' '}
            {renderCurrency({
              amount: balancesMap?.[COIN_ID]?.total ?? 0,
              coinId: COIN_ID,
            })}
          </Text>

          <div className="h-6"></div>

          <div className="flex justify-between">
            <Text color="secondary">External processing fees</Text>
            <Text>Free</Text>
          </div>
          <div className="h-2"></div>
          <div className="flex justify-between">
            <Text color="secondary">Processing time</Text>
            <Text>3-4 business days</Text>
          </div>
          <div className="h-2"></div>
          <Text color="warning" size="sm">
            {' '}
            During processing, you may notice the funds debited from your FTX US
            account and not yet credited to your bank account.
          </Text>
          <div className="h-4"></div>

          <Text size="xs" color="secondary">
            By clicking Submit, I, Max Wu, authorize Circle Internet Financial,
            on behalf of FTX US, on {new Date().toLocaleString().split(',')[0]},
            to electronically debit my account (and, if necessary,
            electronically credit my account) at the financial institution
            indicated by me, in the amount of ${amount ?? '0.00'}. This will
            initiate a single, one-time transaction, on{' '}
            {new Date().toLocaleString().split(',')[0]}. I understand that this
            authorization will remain in full force and effect until I notify
            FTX US that I wish to revoke this authorization, by opening a
            support ticket. I understand that FTX US may not be able to cancel
            my ACH transaction after I have authorized it. I agree that ACH
            transactions I authorize comply with all applicable law.
          </Text>
          <div className="h-4"></div>
          <Button
            className="w-full"
            loading={loadingRequestAchWithdraw}
            disabled={!amount || !accountId}
            onClick={() => {
              if (accountId === null) {
                toast.error('Please select an account');
                return;
              }
              if (!amount) {
                toast.error('Please enter an amount');
                return;
              }
              requestAchWithdraw({
                coin: COIN_ID,
                size: amount,
                achAccountId: accountId,
              });
            }}
          >
            Withdraw
          </Button>
          <div className="h-2"></div>
          <Text color="secondary" size="xs">
            FTX US uses Plaid and Circle to allow you to safely and securely
            deposit funds to your bank account.
          </Text>
        </div>
      </TitledModal>
    </>
  );
}
