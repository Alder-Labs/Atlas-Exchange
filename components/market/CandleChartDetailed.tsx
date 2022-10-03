import { useMemo } from 'react';

import {
  Line,
  ResponsiveContainer,
  YAxis,
  Area,
  ComposedChart,
  Tooltip,
  XAxis,
} from 'recharts';

import { DurationInterval } from '../../lib/duration';

import { ANIMATION_DURATION, ChartGradient } from './ChartGradient';
import { CustomTooltip } from './ToolTip';
import { formatXAxisDate, PriceDataWithDateInterval } from './utils';

const resolveConfig = require('tailwindcss/resolveConfig');

const tailwindConfig = require('../../tailwind.config.js');
const fullConfig = resolveConfig(tailwindConfig);

const now = Math.floor(Date.now() / 1000);

const DEFAULT_CHART_DATA = Array(96).fill({
  timestamp: now * 1000,
  value: 0,
});

export interface CandleChartDetailedProps {
  data?: PriceDataWithDateInterval[];
  duration: DurationInterval;
  height?: number;
  color?: string;
  tooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  offset?: number;
}

export const CandleChartDetailed = (props: CandleChartDetailedProps) => {
  const graphColor: string = fullConfig.theme?.colors['secondaryDark']['70'];

  const {
    data: graphData,
    height,
    tooltip = true,
    color = graphColor,
    duration: durationInterval = '1D',
    showXAxis = false,
    showYAxis = false,
  } = props;

  const { domainMin, domainMax } = useMemo(() => {
    if (!graphData) {
      return {
        domainMin: 0,
        domainMax: 0,
        priceChange: 0,
        priceChangePercent: 0,
      };
    }

    const domainMin = Math.min.apply(
      Math,
      graphData.map((c) => c.value)
    );
    const domainMax = Math.max.apply(
      Math,
      graphData.map((c) => c.value)
    );

    const OFFSET = 0.2;
    const domainMinNormalized = Math.max(
      domainMin - (domainMax - domainMin) * OFFSET,
      0
    );

    // we want the graph to a a little taller than the max and min
    return {
      domainMin: domainMinNormalized,
      domainMax: domainMax,
    };
  }, [graphData]);

  return (
    <ResponsiveContainer height={height} width="98%">
      <ComposedChart data={graphData ?? DEFAULT_CHART_DATA}>
        <defs>
          <ChartGradient id="colorUv" color={color} />
        </defs>
        {tooltip && (
          <Tooltip
            content={(data) => (
              <CustomTooltip {...data} duration={durationInterval} />
            )}
          />
        )}

        <XAxis
          height={60}
          dataKey="timestamp"
          hide={!showXAxis}
          tickLine={false}
          tickMargin={5}
          interval={0}
          padding={{ left: 10, right: 10 }}
          tickCount={5}
          tickFormatter={(timestamp: number, index: number) => {
            if (!graphData) {
              return '';
            } else {
              const result = graphData[index];
              return formatXAxisDate(durationInterval, index, result);
            }
          }}
          style={{
            fontSize: '0.75rem',
          }}
        />
        <YAxis
          type="number"
          hide={!showYAxis}
          domain={[domainMin, domainMax]}
        />
        <Line
          type="linear"
          dataKey="value"
          animationEasing="linear"
          animationDuration={ANIMATION_DURATION}
          strokeWidth={2}
          stroke={graphColor}
          dot={false}
        />
        <Area
          type="linear"
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
