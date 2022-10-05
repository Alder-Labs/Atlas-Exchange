import React, { useMemo } from 'react';

import clsx from 'clsx';
import { useRouter } from 'next/router';

import { useCoins } from '../../hooks/useCoins';
import { useMarkets } from '../../hooks/useMarkets';
import { renderCurrency } from '../../lib/currency';
import { Coin, Market } from '../../lib/types';
import { Text, Title } from '../base';
import { CryptoIcon } from '../CryptoIcon';
import { LoaderDoubleLine, LoaderIconDoubleLine } from '../loaders';
import { DisplayMarketChange } from '../market/DisplayMarketChange';

interface MoverItemProps {
  market: Market;
  coin: Coin;
}

const MoverItemLoading = () => {
  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-4 py-2 pr-2">
        <LoaderIconDoubleLine />
      </div>
      <div className="flex items-center gap-4 py-2 pr-2">
        <LoaderDoubleLine />
      </div>
    </div>
  );
};

const MoverItem = (props: MoverItemProps) => {
  const { market, coin } = props;
  const router = useRouter();

  return (
    <div
      onClick={() => {
        router.push(`/market/${coin.id}`);
      }}
      className="group relative flex cursor-pointer justify-between rounded-sm py-4 transition"
    >
      <div className="absolute -top-0 -bottom-0 -left-4 -right-4 transition group-hover:bg-grayLight-10 dark:group-hover:bg-grayDark-20"></div>
      <div className="flex items-center gap-3 overflow-hidden ">
        <div style={{ zIndex: 1 }} className="shrink-0">
          <CryptoIcon coinId={market.baseCurrency} className="h-8 w-8" />
        </div>
        <div className="flex min-w-0 flex-col">
          <Text className="truncate">{coin.name}</Text>
          <Text color="secondary" size="sm">
            {market.baseCurrency}
          </Text>
        </div>
      </div>
      <div className="flex w-20 items-center justify-end gap-4">
        <div className="flex min-w-0 flex-col items-end">
          <Text>
            {renderCurrency({
              amount: market.last,
              coinId: 'USD',
              showCoinId: false,
            })}
          </Text>
          <DisplayMarketChange changeFraction={market.change24h} />
        </div>
      </div>
    </div>
  );
};

export type TopMoverProps = {
  size?: number;
  filter?: (market: Market) => boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export const TopMovers = (props: TopMoverProps) => {
  const { className, filter = (_: Market) => true, size = 6 } = props;

  const { data: markets, isLoading: marketIsLoading } = useMarkets();
  const { coinsMap, isLoading: coinsIsLoading } = useCoins({
    refetchOnWindowFocus: false,
  });

  const isLoading = marketIsLoading || coinsIsLoading;

  const filteredMarket = useMemo(() => {
    if (!markets) {
      return [];
    }
    return markets
      ?.filter(filter)
      .sort((a, b) => {
        const abs_a = Math.abs(a.change24h);
        const abs_b = Math.abs(b.change24h);
        return abs_b - abs_a;
      })
      .slice(0, size);
  }, [size, filter, markets]);

  return (
    <div className={clsx('', className)}>
      <Title order={4} className="font-bold">
        Top Movers
      </Title>
      <div className="h-2"></div>
      {isLoading &&
        Array.from(Array(size).keys()).map((i) => <MoverItemLoading key={i} />)}
      {!isLoading &&
        filteredMarket &&
        coinsMap &&
        filteredMarket.map((market) => (
          <MoverItem
            key={market.name}
            market={market}
            coin={coinsMap[market.baseCurrency]}
          />
        ))}
    </div>
  );
};
