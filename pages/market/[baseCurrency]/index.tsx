import React, { ComponentType, useEffect, useMemo, useState } from 'react';

import {
  faArrowDown,
  faArrowLeft,
  faArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { Text, Title } from '../../../components/base';
import { CryptoIcon } from '../../../components/CryptoIcon';
import { SidePadding } from '../../../components/layout/SidePadding';
import { CandleChartDetailedProps } from '../../../components/market/CandleChartDetailed';
import { DurationIntervalSelector } from '../../../components/market/DurationIntervalSelector';
import UserTransactions from '../../../components/market/Transactions';
import { priceDataWithDateIntervals } from '../../../components/market/utils';
import { BuySellConvert } from '../../../components/trade/BuySellConvert';
import { useBalances } from '../../../hooks/useBalances';
import { useCoins } from '../../../hooks/useCoins';
import { useMarket } from '../../../hooks/useMarket';
import { useMarketCandles } from '../../../hooks/useMarketCandles';
import { useUserState } from '../../../lib/auth-token-context';
import { renderCurrency } from '../../../lib/currency';
import { DURATION_INFO, DurationInterval } from '../../../lib/duration';
import { buyCoinIdAtom } from '../../../lib/jotai';
import { toast } from '../../../lib/toast';
import { Coin, CoinBalance, CustomPage } from '../../../lib/types';
import { UserStateStatus } from '../../../lib/types/user-states';

const DynamicCandleChartDetailed: ComponentType<CandleChartDetailedProps> =
  dynamic(
    () =>
      import('../../../components/market/CandleChartDetailed').then(
        (mod) => mod.CandleChartDetailed as any
      ),
    { loading: () => <div style={{ height: '60%' }} />, ssr: false }
  );

const Page: CustomPage = () => {
  const router = useRouter();
  const { baseCurrency } = router.query;
  const quoteCurrency = 'USD';

  const [durationInterval, setDurationInterval] =
    useState<DurationInterval>('1M');
  const durationInfo = DURATION_INFO[durationInterval];

  const coinId = typeof baseCurrency === 'string' ? baseCurrency : '';
  const marketName =
    typeof baseCurrency === 'string' ? `${baseCurrency}/${quoteCurrency}` : '';

  const [_, setBuyCoinId] = useAtom(buyCoinIdAtom);
  useEffect(() => {
    if (baseCurrency && typeof baseCurrency === 'string') {
      setBuyCoinId(baseCurrency);
    }
  }, [baseCurrency, setBuyCoinId]);

  const { data: market } = useMarket(
    {
      market: marketName,
      resolution: 900,
    },
    { enabled: marketName.length > 0 }
  );

  const { data: candleData, isLoading: candleDataIsLoading } = useMarketCandles(
    {
      market: marketName,
      resolution: durationInfo.resolution,
      limit: durationInfo.limit,
    },
    {
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
      enabled: marketName.length > 0,
    }
  );

  const priceHistoryNormalized = useMemo(() => {
    if (candleDataIsLoading || !candleData) {
      return undefined;
    }
    if (candleData.length === 0) {
      return undefined;
    }
    const priceData = candleData.map((candle, i) => ({
      timestamp: candle.time,
      value: candle.close,
    }));
    return priceDataWithDateIntervals(priceData);
  }, [candleData, candleDataIsLoading]);

  const { priceChange, priceChangePercent } = useMemo(() => {
    if (!candleData || candleData.length <= 1) {
      return {
        priceChange: 0,
        priceChangePercent: 0,
      };
    }

    const earliestPricePoint = candleData[0].close;
    const latestPricePoint = candleData[candleData.length - 1].close;
    const priceChange = latestPricePoint - earliestPricePoint;
    const priceChangePercent = (priceChange / earliestPricePoint) * 100;

    return {
      priceChange,
      priceChangePercent,
    };
  }, [candleData]);

  const { coinsMap } = useCoins({
    refetchOnWindowFocus: false,
  });
  const { balancesMap, isLoading: balanceLoading } = useBalances();

  const coinMarket = useMemo(() => {
    if (!coinsMap || !market) {
      return null;
    }
    return {
      market: market,
      coin: coinsMap[market.baseCurrency],
    };
  }, [market, coinsMap]);

  return (
    <>
      <SidePadding className="grow">
        <div className="flex w-full grow flex-col items-start lg:flex-row">
          <div className="w-full">
            <div className="pt-8 sm:px-8 sm:pt-10">
              <button
                onClick={() => router.back()}
                className={`mr-2 flex flex-row items-center `}
              >
                <Text
                  size="lg"
                  color="secondary"
                  hoverColor={'normal'}
                  className="flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
                  Back
                </Text>
              </button>
            </div>
            <div className="h-12"></div>
            <div className="sm:px-8">
              <div className="flex flex-row items-center">
                {coinMarket && (
                  <CryptoIcon className="w-8" coinId={coinMarket.coin.id} />
                )}
                <div className="w-2" />
                <Title
                  order={1}
                  isLoading={!coinMarket}
                  loadingWidth={'12rem'}
                  className="font-medium"
                >
                  {coinMarket && coinMarket.coin.name}
                </Title>
                <div className="w-4"></div>
                <div className="rounded-md bg-grayLight-20 px-2 py-0.5 dark:bg-grayDark-20">
                  <Text color="secondary" size="lg">
                    {coinMarket && `${coinMarket.market.baseCurrency}`}
                  </Text>
                </div>
                <div className="w-2" />
              </div>
              <div className="h-8" />
              <div className="flex flex-col">
                <Text size="4xl" isLoading={!coinMarket} loadingWidth={'12rem'}>
                  {coinMarket &&
                    renderCurrency({
                      amount: coinMarket.market.last,
                      coinId: 'USD',
                      showCoinId: false,
                    })}
                </Text>
                {!coinMarket && (
                  <Text
                    size="2xl"
                    isLoading={!coinMarket}
                    loadingWidth={'12rem'}
                  >
                    {' '}
                  </Text>
                )}
                {priceChange < 0 && (
                  <div className={'flex flex-row'}>
                    <FontAwesomeIcon
                      icon={faArrowDown}
                      className={
                        'mr-2 w-3 -rotate-45 text-redLight dark:text-redDark '
                      }
                    />
                    <Text color={'red'}>
                      {`-$${Math.floor(Math.abs(priceChange) * 100) / 100}`} (
                      {Math.floor(priceChangePercent * 100) / 100}%)
                    </Text>
                  </div>
                )}
                {priceChange >= 0 && (
                  <div className={'flex flex-row'}>
                    <FontAwesomeIcon
                      icon={faArrowUp}
                      className={
                        'mr-2 w-3 rotate-45 text-greenLight dark:text-greenDark'
                      }
                    />
                    <Text color={'green'}>
                      {`+$${Math.floor(priceChange * 100) / 100}`} (
                      {Math.floor(priceChangePercent * 100) / 100}%)
                    </Text>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end sm:mt-0">
                <DurationIntervalSelector
                  value={durationInterval}
                  onChange={setDurationInterval}
                />
              </div>
              <div className="h-4" />
              <DynamicCandleChartDetailed
                height={300}
                showXAxis={true}
                data={priceHistoryNormalized}
                duration={durationInterval}
              />
              <div className="flex flex-col">
                {balancesMap && coinsMap && coinsMap[coinId] && (
                  <div>
                    <Title order={4} className="font-medium">
                      Balance
                    </Title>
                    <div className="h-2" />
                    <div className="px-2 lg:px-4">
                      <Balance
                        coin={coinsMap[coinId]}
                        balance={
                          balancesMap[coinId] ?? {
                            coin: coinId,
                            free: 0,
                            spotBorrow: 0,
                            total: 0,
                            usdValue: 0,
                            availableWithoutBorrow: 0,
                          }
                        }
                      />
                    </div>
                  </div>
                )}
                <div className="h-8" />
                <Title order={4} className="font-medium">
                  Transactions
                </Title>
                <div className="h-2"></div>
                <Text color="secondary">
                  Buys, sells, or conversions involving {coinId} are displayed
                  here.
                </Text>
                <div className="h-4"></div>
                <UserTransactions coinId={coinId} />
              </div>
            </div>
          </div>

          <div className="my-8 hidden w-[2px] shrink-0 self-stretch bg-grayLight-10 dark:bg-grayDark-50 sm:block"></div>

          <div className="flex flex-col items-start py-8 sm:p-8">
            <BuySellConvert
              className="h-[24em] w-full lg:w-64"
              fromCoinId="USD"
              toCoinId={coinId}
            />
          </div>
        </div>
        <div className="h-24" />
      </SidePadding>
    </>
  );
};

const Balance = (props: { coin: Coin; balance: CoinBalance }) => {
  const { balance, coin } = props;
  return (
    <div className="flex w-full flex-row justify-between">
      <div className="flex flex-row items-center py-2">
        <CryptoIcon className="h-7 w-7" coinId={coin.id} />
        <div className="ml-2">
          <Text className="ml-2 block" weight="bold">
            {coin.name}
          </Text>
          <Text size="sm" color="secondary" className="ml-2 block">
            {coin.id}
          </Text>
        </div>
      </div>
      <div className="py-2 text-right">
        <Text className="block">
          {renderCurrency({
            amount: balance.usdValue,
            coinId: 'USD',
            showCoinId: false,
          })}
        </Text>
        <Text size="sm" color="secondary" className="block">
          {renderCurrency({
            amount: balance.total,
            coinId: balance.coin,
          })}
        </Text>
      </div>
    </div>
  );
};

export default Page;
