import React, { useCallback, useMemo, useState } from 'react';

import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import {
  faStar,
  faArrowUp,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import { useRouter } from 'next/router';

import { useCoins } from '../../hooks/useCoins';
import { AuthStatus } from '../../hooks/useKycLevel';
import { useMarkets } from '../../hooks/useMarkets';
import { useUserState } from '../../lib/auth-token-context';
import { renderCurrency } from '../../lib/currency';
import { bscFocusedAtom, buyCoinIdAtom } from '../../lib/jotai';
import { Market } from '../../lib/types';
import { getWatchlist, saveWatchlist } from '../../lib/watchlist';
import { Select, Text, Title, TextButton, TextInput } from '../base';
import { CryptoIcon } from '../CryptoIcon';
import { LoaderIconDoubleLine } from '../loaders';
import { Table } from '../table';
import { EmptyContent } from '../table/EmptyContent';
import { ColumnDef } from '../table/Table';
import { useRedirectHandlers } from '../trade/useRedirectHandlers';

const now = Math.floor(Date.now() / 1000);
const hrs24 = 60 * 60 * 24;

enum FilterType {
  None = 'None',
  Watchlist = 'Watchlist',
}

interface TradeProps {
  fromCoinId?: string;
  fromAmount?: string;
  toCoinId?: string;
  toAmount?: string;
}

export type MarketWatchlistProps = {
  updateTradeProps: (props: TradeProps) => void;
} & React.HTMLAttributes<HTMLDivElement>;

export const MarketWatchlist = ({
  className,
  updateTradeProps,
}: MarketWatchlistProps) => {
  const router = useRouter();

  const userState = useUserState();
  const { data: markets, isLoading } = useMarkets();
  const { coinsMap, isLoading: coinsIsLoading } = useCoins({
    refetchOnWindowFocus: false,
  });
  const [watchlist, setWatchlist] = useState(getWatchlist());
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState(FilterType.None);

  const { requireAuthStatus } = useRedirectHandlers();

  // const [quoteCurrency, setQuoteCurrency] = useState<'USD' | 'BTC' | 'none'>(
  //   'USD'
  // );

  const toggleFilter = useCallback(() => {
    if (filter === FilterType.None) {
      setFilter(FilterType.Watchlist);
    } else {
      setFilter(FilterType.None);
    }
  }, [filter]);

  const onClickWatchlist = (market: Market) => {
    setWatchlist((current) => {
      const copy = { ...current };
      if (copy[market.name]) {
        delete copy[market.name];
      } else {
        copy[market.name] = true;
      }
      saveWatchlist(copy);
      return copy;
    });
  };

  const filteredMarket: Market[] = useMemo(() => {
    const FILTERS: Record<
      FilterType,
      { filterFunc: (market: Market) => boolean }
    > = {
      [FilterType.None]: {
        filterFunc: (_: Market) => true,
      },
      [FilterType.Watchlist]: {
        filterFunc: (market: Market) => watchlist[market.name],
      },
    };

    return !markets
      ? []
      : markets
          .filter(FILTERS[filter].filterFunc)
          .filter((item) => item.enabled)
          .filter((item) => {
            return item.quoteCurrency === 'USD';
          })
          .filter((item) => {
            const searchQueryLowercase = searchQuery.toLowerCase();
            const id = item.baseCurrency.toLowerCase();
            const name = coinsMap?.[item.baseCurrency]?.name.toLowerCase();

            return `${id} ${name}`.includes(searchQueryLowercase);
          });
  }, [markets, filter, watchlist, searchQuery, coinsMap]);

  const [_buyCoinId, setBuyCoinId] = useAtom(buyCoinIdAtom);
  const [_bscFocused, setBscFocused] = useAtom(bscFocusedAtom);
  const columns = useMemo<ColumnDef<Market>[]>(
    () => [
      {
        type: 'custom',
        label: 'Asset',
        align: 'left',
        widthClassName: 'w-26 sm:w-44 md:w-48 lg:w-64',
        renderCell: (market: Market) => (
          <div className="h-full pr-4">
            <button className="group relative h-full w-full">
              {/* <div className="absolute top-0 bottom-0 -left-4 right-0 h-full rounded-md transition group-hover:bg-grayLight-20 dark:group-hover:bg-grayDark-40"></div> */}

              <div className="z-10 flex items-center gap-4">
                <CryptoIcon
                  coinId={market.baseCurrency}
                  className="z-10 hidden h-8 w-8 sm:block"
                />
                <div className="flex min-w-min flex-col items-start">
                  <Text>{coinsMap && coinsMap[market.baseCurrency]?.name}</Text>
                  <Text color="secondary" size="sm">
                    {market.baseCurrency}
                  </Text>
                </div>
              </div>
            </button>
          </div>
        ),
        renderLoading: () => {
          return <LoaderIconDoubleLine />;
        },
      },
      {
        type: 'custom',
        label: 'Price',
        align: 'left',
        widthClassName: 'w-20 sm:w-24 lg:w-28 2xl:w-32',
        renderCell: (item) => (
          <div className="ml-1 lg:ml-0">
            {renderCurrency({
              amount: item.ask,
              coinId: item.quoteCurrency,
              showCoinId: false,
            })}
          </div>
        ),
      },
      {
        type: 'custom',
        label: '24h change',
        align: 'left',
        widthClassName: 'w-20 sm:w-20 lg:w-28',
        renderCell: (item) => (
          <div className="ml-1 flex flex-row items-end">
            {item.change24h * 100 < 0 ? (
              <div className={'flex flex-row'}>
                <FontAwesomeIcon
                  icon={faArrowDown}
                  className={
                    'mr-2 w-3 -rotate-45 text-redLight dark:text-redDark'
                  }
                />
                <Text color={'red'}>{(item.change24h * 100).toFixed(2)}%</Text>
              </div>
            ) : (
              <div className={'flex flex-row'}>
                <FontAwesomeIcon
                  icon={faArrowUp}
                  className={
                    'mr-2 w-3 rotate-45 text-greenLight dark:text-greenDark'
                  }
                />
                <Text color={'green'}>
                  {(item.change24h * 100).toFixed(2)}%
                </Text>
              </div>
            )}
          </div>
        ),
      },
      {
        type: 'custom',
        label: 'Action',
        align: 'left',
        show: 'md',
        widthClassName: 'md:w-10 w-12',
        renderCell: (market) => (
          <div>
            <TextButton
              variant={'tertiary'}
              className="font-medium"
              onClick={(e) => {
                e.stopPropagation();

                if (!requireAuthStatus(AuthStatus.KycLevel1)) {
                  return;
                }
                setBuyCoinId(market.baseCurrency);
                setBscFocused(true);
              }}
              renderHitSlop={() => {
                return (
                  <div className="absolute -top-2 -bottom-2 -left-4 -right-4 rounded-md transition group-hover:bg-grayLight-20 dark:group-hover:bg-grayDark-40"></div>
                );
              }}
            >
              <span className="z-10">Buy</span>
            </TextButton>
          </div>
        ),
      },
      {
        type: 'custom',
        label: (
          <div className="flex w-full justify-end">
            <TextButton
              onClick={toggleFilter}
              className="duration-300 ease-in"
              size="md"
            >
              <FontAwesomeIcon
                icon={filter === FilterType.None ? faStarRegular : faStar}
                className="h-3.5 text-grayLight-60 dark:text-grayDark-80"
              />
            </TextButton>
          </div>
        ),
        align: 'right',
        show: 'lg',
        widthClassName: 'w-12',
        renderCell: (item) => {
          const inWatchlist = watchlist[item.name];
          return (
            <div className="flex justify-end">
              {onClickWatchlist && (
                <TextButton
                  renderHitSlop={() => {
                    return (
                      <div className="absolute -top-2 -bottom-2 -left-2 -right-2 z-0 rounded-md transition group-hover:bg-grayLight-20 dark:group-hover:bg-grayDark-40"></div>
                    );
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClickWatchlist(item);
                  }}
                  variant="tertiary"
                  size="md"
                >
                  <div className="z-10">
                    {inWatchlist ? (
                      <FontAwesomeIcon
                        icon={faStar}
                        className="h-3.5 text-grayLight-60 dark:text-grayDark-80"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faStarRegular}
                        className="h-3.5 text-grayLight-60 dark:text-grayDark-80"
                      />
                    )}
                  </div>
                </TextButton>
              )}
            </div>
          );
        },
      },
    ],
    [
      coinsMap,
      filter,
      requireAuthStatus,
      setBscFocused,
      setBuyCoinId,
      toggleFilter,
      watchlist,
    ]
  );

  return (
    <div className={clsx('', className)}>
      <div className="flex items-center justify-between">
        <Title order={4} className="font-bold">
          Market Trends
        </Title>
        <div className="flex flex-row justify-between">
          <div className="hidden text-md md:block">
            <TextInput
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            ></TextInput>
          </div>
          <div className={'w-6'} />
          <Select
            value={filter}
            onSelect={(value) => {
              if (value) setFilter(value);
            }}
            className="w-32"
            options={[
              {
                label: 'All assets',
                value: FilterType.None,
              },
              {
                label: 'Watchlist',
                value: FilterType.Watchlist,
              },
            ]}
          />
        </div>
      </div>
      <div className="h-6"></div>
      <Table
        paginated={true}
        pageSize={10}
        tableClassName="table-fixed"
        rowHeightClassName="h-16"
        className="w-full"
        renderEmpty={() => {
          if (filter === FilterType.Watchlist) {
            return (
              <EmptyContent letter="W">
                <Text size="2xl">Empty watchlist</Text>
                <div>
                  <div className="h-2"></div>
                  <Text size="md" color="secondary">
                    Add your favorite coins to your watchlist with the star
                  </Text>
                </div>
                <div className="h-12" />
              </EmptyContent>
            );
          } else {
            return (
              <EmptyContent letter="A">
                <Text size="2xl">No assets</Text>
                <div className="h-12" />
              </EmptyContent>
            );
          }
        }}
        columns={columns}
        data={filteredMarket}
        loading={isLoading}
        onRowClick={(market) => {
          router.push(`/market/${market.baseCurrency}`);
        }}
      ></Table>
    </div>
  );
};
