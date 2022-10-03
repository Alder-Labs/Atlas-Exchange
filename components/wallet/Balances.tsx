import React, { useCallback, useMemo, useState, ComponentType } from 'react';

import {
  faAngleDown,
  faAngleUp,
  faEllipsisH,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu } from '@headlessui/react';
import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { useBalances } from '../../hooks/useBalances';
import { useCoins } from '../../hooks/useCoins';
import { useMarkets } from '../../hooks/useMarkets';
import { useModalState } from '../../hooks/useModalState';
import { useUserState } from '../../lib/auth-token-context';
import { renderCurrency } from '../../lib/currency';
import { bscFocusedAtom, buyCoinIdAtom } from '../../lib/jotai';
import { Coin, CoinBalance, Market } from '../../lib/types';
import { ModalState } from '../../lib/types/modalState';
import { Button, Text } from '../base';
import { CryptoIcon } from '../CryptoIcon';
import { DropdownMenu } from '../DropdownMenu';
import { LoaderDoubleLine, LoaderIconDoubleLine } from '../loaders';
import { CandleChart, CandleChartProps } from '../market/CandleChart';
import { DisplayMarketChange } from '../market/DisplayMarketChange';
import { Table } from '../table';
import { EmptyContent } from '../table/EmptyContent';
import { ColumnDef } from '../table/Table';

enum SortMethod {
  Asset,
  Price,
  Balance,
}

type CoinBalanceMarket = {
  balance: CoinBalance;
  coin: Coin;
  market: Market | undefined;
};

const SORT_METHODS: Record<
  SortMethod,
  { func: (a: CoinBalanceMarket, b: CoinBalanceMarket) => number }
> = {
  [SortMethod.Asset]: {
    func: (a: CoinBalanceMarket, b: CoinBalanceMarket) => {
      if (a.balance.coin > b.balance.coin) {
        return 1;
      }
      if (a.balance.coin < b.balance.coin) {
        return -1;
      }
      return 0;
    },
  },
  [SortMethod.Price]: {
    func: (a: CoinBalanceMarket, b: CoinBalanceMarket) => {
      if (!a.market) {
        return -1;
      }
      if (!b.market) {
        return 1;
      }
      if (a.market.last > b.market.last) {
        return 1;
      }
      if (a.market.last < b.market.last) {
        return -1;
      }
      return 0;
    },
  },
  [SortMethod.Balance]: {
    func: (a: CoinBalanceMarket, b: CoinBalanceMarket) => {
      if (a.balance.usdValue > b.balance.usdValue) {
        return 1;
      }
      if (a.balance.usdValue < b.balance.usdValue) {
        return -1;
      }
      return 0;
    },
  },
};

const DynamicCandleChart: ComponentType<CandleChartProps> = dynamic(
  () => import('../market/CandleChart').then((mod) => mod.CandleChart as any),
  { loading: () => <div style={{ height: 300 }} /> }
);

interface WalletBalancesProps {
  onClickBuy: (market: Market) => void;
}
export const WalletBalances = (props: WalletBalancesProps) => {
  const userState = useUserState();
  const isLoggedIn = !!userState.user;

  const [_buyCoinId, setBuyCoinId] = useAtom(buyCoinIdAtom);
  const [bscFocused, setBscFocused] = useAtom(bscFocusedAtom);
  const router = useRouter();

  const { balances, isLoading: balanceLoading } = useBalances({
    enabled: isLoggedIn,
  });
  const { coinsMap, isLoading: coinsLoading } = useCoins({
    refetchOnWindowFocus: false,
  });
  const { data: markets, isLoading: marketsLoading } = useMarkets();
  const [modalStateDetailed, setModalStateDetailed, handlers] = useModalState();

  const [sortMethod, setSortMethod] = useState(SortMethod.Asset);
  const [sortReverse, setSortReverse] = useState(false);

  const onChangeSortMethod = useCallback(
    (newMethod: SortMethod) => {
      if (newMethod !== sortMethod) {
        setSortMethod(newMethod);
        return;
      }
      setSortReverse((s) => !s);
    },
    [sortMethod]
  );

  const marketsMap = useMemo(() => {
    if (!markets) {
      return {};
    }
    const marketsMap: Record<string, Market> = {};
    for (const market of markets) {
      marketsMap[market.name] = market;
    }
    return marketsMap;
  }, [markets]);

  // combine coins, balances and filtering into a single obj
  const { coinBalances, isLoading } = useMemo(() => {
    if (balanceLoading || coinsLoading || marketsLoading || !coinsMap) {
      return {
        isLoading: balanceLoading || coinsLoading,
        coinBalances: [],
      };
    }
    return {
      isLoading: balanceLoading || coinsLoading,
      coinBalances: balances
        ?.map((balance) => {
          const coin = coinsMap[balance.coin];
          let market = undefined;
          if (coin.fiat || coin.usdFungible) {
            market = undefined;
          } else {
            market = marketsMap[`${balance.coin}/USD`];
          }

          return {
            balance,
            coin,
            // we mostly only care about price in relation to USD
            market,
          };
        })
        .sort((a, b) => {
          const res = SORT_METHODS[sortMethod].func(a, b);
          if (sortReverse) {
            console.log('sortReverse', sortReverse);
            return res * -1;
          }
          return res;
        }),
    };
  }, [
    balanceLoading,
    coinsLoading,
    marketsLoading,
    coinsMap,
    marketsMap,
    balances,
    sortMethod,
    sortReverse,
  ]);

  return (
    <div>
      <Table
        tableClassName="w-full table-fixed"
        rowHeightClassName="h-16"
        data={coinBalances ?? []}
        loading={isLoading || balanceLoading}
        pageSize={12}
        paginated={true}
        renderEmpty={() => {
          return (
            <EmptyContent letter="A">
              <Text size="2xl">No assets</Text>
              <div>
                <div className="h-2"></div>
                <Text size="md" color="secondary">
                  Deposit your preferred currency to start trading now
                </Text>
              </div>
              <div className="h-4" />
              <Button onClick={() => router.push('/deposit')}>Deposit</Button>
              <div className="h-12" />
            </EmptyContent>
          );
        }}
        columns={useMemo<
          ColumnDef<{
            balance: CoinBalance;
            coin: Coin;
            market: Market | undefined;
          }>[]
        >(
          () => [
            {
              type: 'custom',
              label: (
                <div
                  className="cursor-pointer"
                  onClick={() => onChangeSortMethod(SortMethod.Asset)}
                >
                  <Text
                    className="flex flex-row items-center"
                    size="sm"
                    weight="light"
                    color="secondary"
                  >
                    <div>Asset</div>
                    <div className="w-2" />
                    {sortMethod === SortMethod.Asset && (
                      <FontAwesomeIcon
                        icon={sortReverse ? faAngleUp : faAngleDown}
                        className="h-2"
                      ></FontAwesomeIcon>
                    )}
                  </Text>
                </div>
              ),
              widthClassName: 'lg:w-32 md:w-20',
              renderLoading() {
                return <LoaderIconDoubleLine />;
              },
              renderCell: (row) => {
                return (
                  <div className="flex cursor-pointer flex-row items-center py-2">
                    <CryptoIcon
                      className="hidden h-7 w-7 sm:block"
                      coinId={row.coin.id}
                    />
                    <div className="ml-0 min-w-0 sm:ml-2">
                      <Text className="ml-2 block truncate" weight="bold">
                        {row.coin.name}
                      </Text>
                      <Text size="sm" color="secondary" className="ml-2 block">
                        {row.coin.id}
                      </Text>
                    </div>
                  </div>
                );
              },
            },
            {
              type: 'custom',
              align: 'right',
              widthClassName: 'lg:w-24',
              label: '',
              show: 'lg',
              renderCell: (row) => {
                return (
                  <div
                    onClick={() => {
                      if (!(row.coin.fiat || row.coin.usdFungible)) {
                        router.push(`/market/${row.coin.id}`);
                      }
                    }}
                    className="ml-8 flex h-16 cursor-pointer items-center"
                  >
                    {row.market && (
                      <DynamicCandleChart
                        height="60%"
                        lineWidth={1}
                        market={row.market.name}
                        duration={'1D'}
                      />
                    )}
                  </div>
                );
              },
            },
            {
              type: 'custom',
              align: 'right',
              label: (
                <div
                  className="cursor-pointer"
                  onClick={() => onChangeSortMethod(SortMethod.Price)}
                >
                  <Text
                    className="flex flex-row-reverse items-center"
                    size="sm"
                    weight="light"
                    color="secondary"
                  >
                    <div>Price</div>
                    <div className="w-2" />
                    {sortMethod === SortMethod.Price && (
                      <FontAwesomeIcon
                        icon={sortReverse ? faAngleUp : faAngleDown}
                        className="h-2"
                      ></FontAwesomeIcon>
                    )}
                  </Text>
                </div>
              ),
              widthClassName: 'lg:w-20',
              show: 'md',
              renderLoading: () => {
                return <LoaderDoubleLine />;
              },
              renderCell: (row) => {
                return (
                  <div className="w-full py-2 text-right">
                    <Text className="block">
                      {row.market?.price
                        ? renderCurrency({
                            amount: row.market?.price,
                            coinId: 'USD',
                            showCoinId: false,
                            maxFixedDigits: 8,
                          })
                        : '--'}
                    </Text>
                    {row.market && (
                      <div className="flex justify-end">
                        <DisplayMarketChange
                          changeFraction={row.market.change24h}
                        />
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              type: 'custom',
              align: 'right',
              label: (
                <div
                  className="cursor-pointer"
                  onClick={() => onChangeSortMethod(SortMethod.Balance)}
                >
                  <Text
                    className="flex flex-row-reverse items-center"
                    size="sm"
                    weight="light"
                    color="secondary"
                  >
                    <div>Balance</div>
                    <div className="w-2" />
                    {sortMethod === SortMethod.Balance && (
                      <FontAwesomeIcon
                        icon={sortReverse ? faAngleUp : faAngleDown}
                        className="h-2"
                      ></FontAwesomeIcon>
                    )}
                  </Text>
                </div>
              ),
              widthClassName: 'lg:w-20',
              renderLoading: () => {
                return <LoaderDoubleLine />;
              },
              renderCell: (row) => {
                return (
                  <div className="w-full py-2 text-right">
                    <Text className="block">
                      {renderCurrency({
                        amount: row.balance.usdValue,
                        coinId: 'USD',
                        showCoinId: false,
                      })}
                    </Text>
                    <Text size="sm" color="secondary" className="block">
                      {renderCurrency({
                        amount: row.balance.total,
                        coinId: row.balance.coin,
                      })}
                    </Text>
                  </div>
                );
              },
            },
            {
              type: 'custom',
              align: 'right',
              label: 'Action',
              widthClassName: 'w-14',
              renderCell: (row) => {
                return (
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu
                      menuItemClassName="text-right w-full whitespace-nowrap"
                      options={[
                        ...(row.market
                          ? [
                              {
                                text: `Buy ${row.coin.id}`,
                                onClick: () => {
                                  setBuyCoinId(row.coin.id);
                                  setBscFocused(true);
                                },
                              },
                            ]
                          : []),
                        ...(row.coin.canDeposit || row.coin.fiat
                          ? [
                              {
                                text: row.coin.fiat
                                  ? `Deposit ${row.coin.id}`
                                  : `Receive ${row.coin.id}`,
                                onClick: () => {
                                  if (row.coin.fiat) {
                                    setModalStateDetailed({
                                      state: ModalState.DepositFiat,
                                    });
                                  } else {
                                    setModalStateDetailed({
                                      state: ModalState.ReceiveCryptoAddress,
                                      coinId: row.coin.id,
                                    });
                                  }
                                },
                              },
                            ]
                          : []),
                        ...(row.coin.canWithdraw || row.coin.fiat
                          ? [
                              {
                                text: row.coin.fiat
                                  ? `Withdraw ${row.coin.id}`
                                  : `Send ${row.coin.id}`,
                                onClick: () => {
                                  if (row.coin.fiat) {
                                    setModalStateDetailed({
                                      state: ModalState.WithdrawFiat,
                                    });
                                  } else {
                                    setModalStateDetailed({
                                      state: ModalState.SendCryptoForm,
                                      coinId: row.coin.id,
                                    });
                                  }
                                },
                              },
                            ]
                          : []),
                      ]}
                    >
                      <Menu.Button className="focus:outline-none">
                        <div className="dark:hover:bg-grayDark-40 hover:bg-grayLight-20 flex h-7 w-7 flex-row items-center justify-center rounded-full transition">
                          <FontAwesomeIcon
                            icon={faEllipsisH}
                            className="w-3 font-bold text-black dark:text-white"
                          />
                        </div>
                      </Menu.Button>
                    </DropdownMenu>
                  </div>
                );
              },
            },
          ],
          [
            router,
            setBscFocused,
            setBuyCoinId,
            onChangeSortMethod,
            setModalStateDetailed,
            sortMethod,
            sortReverse,
          ]
        )}
        onRowClick={(row) => {
          if (!(row.coin.fiat || row.coin.usdFungible)) {
            router.push(`/market/${row.coin.id}`);
          }
        }}
      ></Table>
    </div>
  );
};
