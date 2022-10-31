import React, { useMemo, useState } from 'react';

import {
  useDepositTransactions,
  useFills,
  useWithdrawTransactions,
} from '../../hooks/wallet';
import { renderCurrency } from '../../lib/currency';
import { formatDate } from '../../lib/date';
import { DepositTransaction, Fill, WithdrawTransaction } from '../../lib/types';
import { Select, Text } from '../base';
import { Responsive } from '../layout/Responsive';
import { EmptyContent } from '../table/EmptyContent';
import { StatusBadge } from '../wallet/StatusBadge';

type Transaction =
  | {
      type: 'deposit';
      data: DepositTransaction;
    }
  | {
      type: 'withdraw';
      data: WithdrawTransaction;
    }
  | {
      type: 'fill';
      data: Fill;
    };

enum FilterType {
  None = 'None',
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Fill = 'Fill',
}

const FILTERS: Record<
  FilterType,
  { filterFunc: (coin: Transaction) => boolean }
> = {
  [FilterType.None]: {
    filterFunc: (_: Transaction) => true,
  },
  [FilterType.Deposit]: {
    filterFunc: (transaction: Transaction) => transaction.type === 'deposit',
  },
  [FilterType.Withdraw]: {
    filterFunc: (transaction: Transaction) => transaction.type === 'withdraw',
  },
  [FilterType.Fill]: {
    filterFunc: (transaction: Transaction) => transaction.type === 'fill',
  },
};

export const UserTransactions = (props: { coinId?: string }) => {
  const { coinId } = props;

  const {
    data: deposits,
    error: depositsError,
    isLoading: depositsLoading,
  } = useDepositTransactions();
  const {
    data: withdrawals,
    error: withdrawalsError,
    isLoading: withdrawalsLoading,
  } = useWithdrawTransactions();
  const {
    data: trades,
    error: tradesError,
    isLoading: tradesLoading,
  } = useFills();

  const depositTransactions = useMemo(() => {
    if (!deposits) {
      return [];
    } else if (coinId) {
      return deposits.filter((tx) => tx.coin === coinId);
    } else {
      return deposits;
    }
  }, [coinId, deposits]);
  const withdrawalTransactions = useMemo(() => {
    if (!withdrawals) {
      return [];
    } else if (coinId) {
      return withdrawals.filter((tx) => tx.coin === coinId);
    } else {
      return withdrawals;
    }
  }, [coinId, withdrawals]);
  const tradeTransactions = useMemo(() => {
    if (!trades) {
      return [];
    } else if (coinId) {
      return trades.filter(
        (tx) => tx.quoteCurrency === coinId || tx.baseCurrency === coinId
      );
    } else {
      return trades;
    }
  }, [coinId, trades]);

  const isLoading = depositsLoading || withdrawalsLoading || tradesLoading;
  const isError = depositsError || withdrawalsError || tradesError;
  const transactions: Transaction[] = useMemo(() => {
    if (isLoading || isError) {
      return [];
    }
    const transactions: Transaction[] = [
      ...depositTransactions.map((item) => ({
        type: 'deposit' as const,
        data: item,
      })),
      ...withdrawalTransactions.map((item) => ({
        type: 'withdraw' as const,
        data: item,
      })),
      ...tradeTransactions.map((item) => ({
        type: 'fill' as const,
        data: item,
      })),
    ];
    transactions.sort(
      (a, b) => Date.parse(b.data.time) - Date.parse(a.data.time)
    );

    return transactions;
  }, [
    depositTransactions,
    withdrawalTransactions,
    tradeTransactions,
    isError,
    isLoading,
  ]);

  const [filter, setFilter] = useState(FilterType.None);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(FILTERS[filter].filterFunc);
  }, [transactions, filter]);

  return (
    <div>
      {/*
      <div className="flex items-center justify-end">
        <Select<FilterType>
          className="w-32"
          options={[
            { label: 'All', value: FilterType.None },
            { label: 'Deposits', value: FilterType.Deposit },
            { label: 'Withdrawals', value: FilterType.Withdraw },
            { label: 'Trades', value: FilterType.Fill },
          ]}
          onSelect={(value) => {
            if (value) setFilter(value);
          }}
          value={filter}
        />
      </div>
        */}
      {filteredTransactions.length === 0 && (
        <EmptyContent letter="T">
          <Text size="2xl">No transactions</Text>
          <div className="h-12" />
        </EmptyContent>
      )}
      {filteredTransactions.map((tx) => {
        switch (tx.type) {
          case 'deposit':
            return <DepositTransactionCard data={tx.data} />;
          case 'withdraw':
            return <WithdrawTransactionCard data={tx.data} />;
          case 'fill':
            return <FillTransactionCard data={tx.data} />;
        }
      })}
    </div>
  );
};

const TransactionCard = (props: { children: React.ReactNode }) => {
  return (
    <div
      className={`flex flex-col px-2 py-4 duration-300 hover:bg-grayLight-20 dark:hover:bg-grayDark-20 lg:p-4`}
    >
      {props.children}
    </div>
  );
};

const DepositTransactionCard = (props: { data: DepositTransaction }) => {
  const { data: tx } = props;
  return (
    <TransactionCard>
      <div className="flex flex-row items-center justify-between">
        <Text weight="bold">Deposit</Text>
        <StatusBadge status={tx.status} />
      </div>
      <div className="h-2" />
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-start">
          <Text>
            {renderCurrency({ amount: tx.size ?? 0, coinId: tx.coin })}
          </Text>
        </div>
        <Text>{formatDate(new Date(tx.time))}</Text>
      </div>
    </TransactionCard>
  );
};

const WithdrawTransactionCard = (props: { data: WithdrawTransaction }) => {
  const { data: tx } = props;
  return (
    <TransactionCard>
      <div className="flex flex-row items-center justify-between">
        <Text weight="bold">Withdraw</Text>
        <StatusBadge status={tx.status} />
      </div>
      <div className="h-2" />
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-start">
          <Text>{renderCurrency({ amount: tx.size, coinId: tx.coin })}</Text>
          <div className="w-2" />
          {tx.address && <Text>To {tx.address}</Text>}
        </div>
        <Text>{formatDate(new Date(tx.time))}</Text>
      </div>
    </TransactionCard>
  );
};

const FillTransactionCard = (props: { data: Fill }) => {
  const { data: tx } = props;
  return (
    <TransactionCard>
      <div className="flex flex-row items-center justify-between">
        <Text weight="bold">Trade</Text>
        <StatusBadge status="complete" />
      </div>
      <div className="h-2" />
      <div className="flex flex-row justify-between lg:items-center">
        <div className="flex flex-col items-start lg:flex-row">
          <Text>
            {renderCurrency({
              amount: tx.size,
              coinId: tx.baseCurrency,
            })}
          </Text>
          <Responsive showIfLargerThan="lg">
            <div className="w-2" />
          </Responsive>
          <Text color="secondary" size="sm">
            For{' '}
            {renderCurrency({
              amount: tx.size * tx.price,
              coinId: tx.quoteCurrency,
            })}
          </Text>
        </div>
        <div className="pl-4 text-right">
          <Text>{formatDate(new Date(tx.time))}</Text>
        </div>
      </div>
    </TransactionCard>
  );
};

export default UserTransactions;
