import React from 'react';

import moment from 'moment';
import { TooltipProps } from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

import { DurationInterval } from '../../lib/duration';
import { Text } from '../base';

type CustomTooltipProps = {
  duration: DurationInterval;
} & TooltipProps<ValueType, NameType>;

const CustomToolTipCard = (props: { children: React.ReactNode }) => {
  return (
    <div
      className={`flex flex-col rounded-md border border-grayLight-60
        bg-grayLight-10 px-3 py-2
        shadow-md outline-none dark:border-grayDark-60 dark:bg-grayDark-10`}
    >
      {props.children}
    </div>
  );
};

export const LoadingToolTip = () => {
  return (
    <CustomToolTipCard>
      <Text weight="bold">Loading</Text>
    </CustomToolTipCard>
  );
};

export const CustomTooltip = (props: CustomTooltipProps) => {
  const { active, payload, duration } = props;

  if (!active || !payload || !payload.length) {
    return null;
  }

  const { timestamp, value } = payload[0].payload;

  const date = new Date(timestamp);
  let label;
  switch (duration) {
    case '1D':
    case '1W':
    case '1M':
      label = moment(date).format('MMM DD, YYYY h:mm A');
      break;
    default:
      label = moment(date).format('MMM DD, YYYY');
      break;
  }

  return (
    <CustomToolTipCard>
      <Text weight="bold">${`${value}`}</Text>
      <Text color="secondary" size="sm">
        {label}
      </Text>
    </CustomToolTipCard>
  );
};

export const LoadingLabel = () => {
  // eslint-disable-next-line react/prop-types
  // const { x, y, payload } = props;

  return <Text>Loading</Text>;
};
