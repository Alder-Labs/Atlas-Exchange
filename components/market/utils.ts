import moment from 'moment';

import { DurationInterval } from '../../lib/duration';

export type PriceDataWithDateInterval = {
  timestamp: number;
  value: number;
  hour?: number;
  day?: number;
  month?: number;
  year?: number;
};

export function priceDataWithDateIntervals(
  data: { timestamp: number; value: number }[]
): PriceDataWithDateInterval[] {
  const normalized: PriceDataWithDateInterval[] = data.map((candle, i) => {
    const timestamp = new Date(candle.timestamp);
    if (i === 0) {
      return candle;
    } else {
      const prevTimestamp = new Date(data[i - 1].timestamp);
      const prevDay = moment(prevTimestamp).format('D');
      const currDay = moment(timestamp).format('D');
      return {
        ...candle,
        hour:
          prevTimestamp.getHours() != timestamp.getHours()
            ? timestamp.getHours()
            : undefined,
        day: prevDay != currDay ? Number(currDay) : undefined,
        month:
          prevTimestamp.getMonth() != timestamp.getMonth()
            ? timestamp.getMonth()
            : undefined,
        year:
          prevTimestamp.getFullYear() != timestamp.getFullYear()
            ? timestamp.getFullYear()
            : undefined,
      };
    }
  });
  return normalized;
}

function numToMonth(n: number): string {
  const date = new Date();
  date.setMonth(n);

  return date.toLocaleString('en-US', {
    month: 'short',
  });
}

export const formatXAxisDate = (
  durationInterval: DurationInterval,
  index: number,
  result: PriceDataWithDateInterval
) => {
  const { timestamp, hour, day, month, year } = result;
  const date = new Date(timestamp);

  switch (durationInterval) {
    case '1D':
      if (index < 2) {
        return '';
      }
      if (day) {
        return moment(date).format('D');
      }
      if (hour && [4, 8, 12, 16, 20].includes(hour)) {
        return moment(date).format('h:mm A');
      }
      return '';
    case '1W':
      if (year) {
        return `${year}`;
      }
      if (month) {
        return numToMonth(month);
      }
      if (day) {
        return moment(date).format('D');
      }
      return '';
    case '1M':
      if (year) {
        return `${year}`;
      }
      if (month) {
        return numToMonth(month);
      }
      if (day && [3, 6, 9, 12, 15, 18, 21, 24].includes(day)) {
        return moment(date).format('D');
      }
      return '';
    case '3M':
      if (year) {
        return `${year}`;
      }
      if (month) {
        return numToMonth(month);
      }
      if (day && [8, 16].includes(day)) {
        return moment(date).format('D');
      }
      return '';
    case '6M':
      if (year) {
        return `${year}`;
      }
      if (month) {
        return numToMonth(month);
      }
      return '';
    default:
      if (year) {
        return `${year}`;
      }
      if (month && [2, 4, 6, 8, 10, 12].includes(month)) {
        return numToMonth(month);
      }
      return '';
  }
};
