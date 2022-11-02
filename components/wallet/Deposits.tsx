import React from 'react';

import { useRouter } from 'next/router';

import { useDepositTransactions } from '../../hooks/wallet';
import { renderCurrency } from '../../lib/currency';
import { formatDate } from '../../lib/date';
import { toast } from '../../lib/toast';
import { Button, Text } from '../base';
import { LoaderDoubleLine } from '../loaders';
import { Table } from '../table';
import { EmptyContent } from '../table/EmptyContent';

import { StatusBadge } from './StatusBadge';

export const DepositTransactions = () => {
  const router = useRouter();
  const { data: transactions, isLoading } = useDepositTransactions(
    {},
    {
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  return (
    <Table
      tableClassName="w-full table-fixed"
      loading={isLoading}
      paginated={true}
      pageSize={12}
      rowHeightClassName="h-16"
      data={transactions ?? []}
      renderEmpty={() => {
        return (
          <EmptyContent letter="D">
            <Text size="2xl">No deposits</Text>
            <div>
              <div className="h-2"></div>
              <Text size="md" color="secondary">
                Deposit your preferred currency to start trading crypto
              </Text>
            </div>
            <div className="h-4" />
            <Button onClick={() => router.push('/deposit')}>Deposit</Button>
            <div className="h-12" />
          </EmptyContent>
        );
      }}
      columns={[
        {
          type: 'custom',
          label: 'Type',
          renderLoading: () => <LoaderDoubleLine />,
          renderCell: (row) => {
            return (
              <div>
                <div>
                  <Text>Deposit</Text>
                </div>
                <div className="-mt-1">
                  <Text color="secondary" size="sm">
                    {formatDate(new Date(row.time))}
                  </Text>
                </div>
              </div>
            );
          },
        },
        {
          type: 'custom',
          align: 'left',
          show: 'md',
          label: 'Status',
          renderCell: (row) => {
            return (
              <div className="flex">
                <StatusBadge status={row.status} />
              </div>
            );
          },
        },
        {
          type: 'string',
          align: 'right',
          show: 'lg',
          label: 'Currency',
          getCellValue: (row) => row.coin,
        },
        {
          type: 'string',
          align: 'right',
          label: 'Amount',
          getCellValue: (row) =>
            renderCurrency({
              amount: row.size ?? 0,
              coinId: row.coin,
            }),
        },
      ]}
    />
  );
};

export default DepositTransactions;
