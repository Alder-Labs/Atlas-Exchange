import { useMemo } from 'react';

import {
  Line,
  ResponsiveContainer,
  YAxis,
  Area,
  ComposedChart,
} from 'recharts';

import { useMarketCandles } from '../../hooks/market';
import { DurationInterval, DURATION_INFO } from '../../lib/duration';
import { toast } from '../../lib/toast';

import { ANIMATION_DURATION, ChartGradient } from './ChartGradient';

const resolveConfig = require('tailwindcss/resolveConfig');

const tailwindConfig = require('../../tailwind.config.js');
const fullConfig = resolveConfig(tailwindConfig);

const now = Math.floor(Date.now() / 1000);

const DEFAULT_CHART_DATA = Array(96).fill({
  name: now * 1000,
  value: 0,
});

export interface CandleChartProps {
  height?: number | string;
  color?: string;
  duration: DurationInterval;
  lineWidth?: number;
  market: string;
}
export const CandleChart = (props: CandleChartProps) => {
  const graphColor: string = fullConfig.theme?.colors['secondaryDark']['70'];

  const {
    market,
    height,
    lineWidth = 2,
    color = graphColor,
    duration = '1D',
  } = props;

  const { limit, resolution } = DURATION_INFO[duration];

  const { data: candleData } = useMarketCandles(
    {
      market,
      resolution: resolution,
      limit: limit,
    },
    {
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
      refetchOnWindowFocus: false,
    }
  );

  const priceHistoryNormalized = useMemo(() => {
    if (!candleData) {
      return DEFAULT_CHART_DATA;
    }
    if (candleData.length === 0) {
      return DEFAULT_CHART_DATA;
    }
    return candleData.map((r) => ({
      name: r.time,
      value: Math.floor(r.close * 100) / 100,
    }));
  }, [candleData]);

  const { domainMin, domainMax } = useMemo(() => {
    if (candleData) {
      const domainMin = Math.min.apply(
        Math,
        candleData.map((c) => c.close)
      );
      const domainMax = Math.max.apply(
        Math,
        candleData.map((c) => c.close)
      );

      return {
        domainMin,
        domainMax,
      };
    }
    return {
      domainMin: 0,
      domainMax: 0,
    };
  }, [candleData]);

  return (
    <ResponsiveContainer height={height} width="100%">
      <ComposedChart data={priceHistoryNormalized}>
        <defs>
          <ChartGradient id="colorUv" color={color} />
        </defs>
        <YAxis type="number" hide={true} domain={[domainMin, domainMax]} />
        <Line
          animationEasing="linear"
          animationDuration={ANIMATION_DURATION}
          type="monotone"
          strokeWidth={lineWidth}
          dataKey="value"
          stroke={graphColor}
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="value"
          animationEasing="linear"
          animationDuration={ANIMATION_DURATION}
          stroke="none"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorUv)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
