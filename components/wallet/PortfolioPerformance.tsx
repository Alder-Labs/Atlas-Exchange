import { ComponentType, ReactComponentElement, useMemo, useState } from 'react';

import dynamic from 'next/dynamic';

import { useUsdValueSnapshots } from '../../hooks/useUsdValueSnapshots';
import { useUserState } from '../../lib/auth-token-context';
import { DurationInterval, DURATION_INFO } from '../../lib/duration';
import { toast } from '../../lib/toast';
import { Text } from '../base';
import { CandleChartDetailedProps } from '../market/CandleChartDetailed';
import { DurationIntervalSelector } from '../market/DurationIntervalSelector';
import { priceDataWithDateIntervals } from '../market/utils';

const resolveConfig = require('tailwindcss/resolveConfig');

const tailwindConfig = require('../../tailwind.config.js');
const fullConfig = resolveConfig(tailwindConfig);

const now = Math.floor(Date.now() / 1000);

const DEFAULT_CHART_DATA = Array(96).fill({
  timestamp: now * 1000,
  value: 0,
});

const DynamicCandleChartDetailed: ComponentType<CandleChartDetailedProps> =
  dynamic(
    () =>
      import('../market/CandleChartDetailed').then(
        (mod) => mod.CandleChartDetailed as any
      ),
    { loading: () => <div style={{ height: 300 }} /> }
  );

export const PortfolioPerformance = () => {
  const userState = useUserState();
  const isLoggedIn = !!userState.user;

  const [durationInterval, setDurationInterval] =
    useState<DurationInterval>('1M');

  const { data: portfolioValue, isLoading: portfolioValueLoading } =
    useUsdValueSnapshots(
      {
        limit: 25,
        startTime: now,
        endTime: now,
      },
      {
        onError: (err: Error) => {
          toast.error(`Error: ${err.message}`);
        },
        enabled: isLoggedIn,
      }
    );

  const { data: priceData, isLoading: priceDataLoading } = useUsdValueSnapshots(
    {
      limit: DURATION_INFO[durationInterval].limit,
      startTime: now - DURATION_INFO[durationInterval].duration,
      endTime: now,
    },
    {
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
      enabled: isLoggedIn,
    }
  );

  const graphIsLoading = priceDataLoading || portfolioValueLoading;

  const priceHistoryNormalized = useMemo(() => {
    if (!priceData) {
      return undefined;
    }
    if (priceData.records.length === 0) {
      return undefined;
    }
    let records = priceData.records
      .map((r) => ({
        timestamp: new Date(r.time).getTime(),
        value: Math.floor(r.usdValue * 100) / 100,
      }))
      .reverse();
    if (portfolioValue) {
      records = [
        ...records,
        {
          timestamp: new Date(portfolioValue.now).getTime(),
          value: Math.floor(portfolioValue.value * 100) / 100,
        },
      ];
    }
    return priceDataWithDateIntervals(records);
  }, [priceData, portfolioValue]);

  const { priceChange, priceChangePercent } = useMemo(() => {
    const defaultValues = {
      priceChange: 0,
      priceChangePercent: 0,
    };

    if (!priceData || priceData.records.length <= 1) {
      return defaultValues;
    }

    const earliestPricePoint =
      priceData.records[priceData.records.length - 1].usdValue;
    const latestPricePoint = priceData.value;
    const priceChange = latestPricePoint - earliestPricePoint;
    const priceChangePercent = (priceChange / earliestPricePoint) * 100;

    return {
      priceChange,
      priceChangePercent,
    };
  }, [priceData]);

  const priceChangeStyle =
    priceChange >= 0 ? 'text-marketUp text-xl' : 'text-marketDown text-xl';
  const graphColor: string = fullConfig.theme?.colors['secondaryDark']['70'];

  return (
    <div className="w-full">
      <Text color="secondary" className="block">
        Total Portfolio Balance
      </Text>
      {/*<div className={'h-2'} />*/}
      <div className="flex flex-col">
        <Text
          size="4xl"
          isLoading={portfolioValueLoading}
          loadingWidth={'12rem'}
          weight="medium"
        >
          {portfolioValue &&
            `$${Math.floor(portfolioValue.value * 100) / 100} USD`}
        </Text>
      </div>
      <div className="flex flex-col">
        <Text
          className={priceChangeStyle}
          color={
            priceChange >= 0 ? (priceChange === 0 ? 'normal' : 'green') : 'red'
          }
          weight="medium"
          isLoading={priceDataLoading}
          loadingWidth={'6rem'}
        >
          {priceChange >= 0
            ? `+$${Math.floor(priceChange * 100) / 100}`
            : `-$${Math.floor(Math.abs(priceChange) * 100) / 100}`}{' '}
          ({Math.floor(priceChangePercent * 100) / 100}%)
        </Text>
      </div>
      <div className="mb-4"></div>
      <div>
        <div className="flex justify-end">
          <DurationIntervalSelector
            value={durationInterval}
            onChange={setDurationInterval}
          />
        </div>
        <div className="h-12"></div>
        <DynamicCandleChartDetailed
          height={300}
          showXAxis={true}
          data={priceHistoryNormalized}
          duration={durationInterval}
        />
      </div>
    </div>
  );
};
