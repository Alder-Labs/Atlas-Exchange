import React from 'react';

import { useFills } from '../../hooks/useFills';
import { renderCurrency } from '../../lib/currency';
import { formatDate } from '../../lib/date';
import { toast } from '../../lib/toast';
import { Text } from '../base';
import { LoaderDoubleLine } from '../loaders';
import { Table } from '../table';
import { EmptyContent } from '../table/EmptyContent';

export const TradeTransactions = () => {
  const { data: transactions, isLoading } = useFills(
    {},
    {
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  return (
    <div>
      <Table
        paginated={true}
        pageSize={12}
        rowHeightClassName="h-16"
        tableClassName="w-full table-fixed"
        loading={isLoading}
        data={transactions ?? []}
        renderEmpty={() => {
          return (
            <EmptyContent letter="T">
              <Text size="2xl">No Trades</Text>
              <div>
                <div className="h-2"></div>
                <Text size="md" color="secondary">
                  Start trading using the convert feature
                </Text>
              </div>
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
                <div className="">
                  <div>
                    <Text>Trade</Text>
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
            align: 'right',
            label: 'Amount',
            renderLoading: () => <LoaderDoubleLine />,
            renderCell: (row) => {
              return (
                <div className="text-right">
                  <div>
                    <Text>
                      {renderCurrency({
                        amount: row.size,
                        coinId: row.baseCurrency,
                      })}
                    </Text>
                  </div>
                  <div className="-mt-1">
                    <Text color="secondary" size="sm">
                      For{' '}
                      {renderCurrency({
                        amount: row.size * row.price,
                        coinId: row.quoteCurrency,
                      })}
                    </Text>
                  </div>
                </div>
              );
            },
          },
        ]}
      />
    </div>
  );
};

export default TradeTransactions;
