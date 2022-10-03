export const DAY = 60 * 60 * 24;

export type DurationInterval = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

export const DURATION_INTERVALS: Array<DurationInterval> = [
  '1D',
  '1W',
  '1M',
  '3M',
  '6M',
  '1Y',
];

export const DURATION_INFO: Record<
  DurationInterval,
  {
    resolution: number;
    limit: number;
    duration: number;
  }
> = {
  '1D': {
    resolution: 900,
    limit: 96,
    duration: DAY,
  },
  '1W': {
    resolution: 3600,
    limit: 168,
    duration: DAY * 7,
  },
  '1M': {
    resolution: 14400,
    limit: 183,
    duration: DAY * 30,
  },
  '3M': {
    resolution: 86400,
    limit: 91,
    duration: DAY * 91,
  },
  '6M': {
    resolution: 172800,
    limit: 182,
    duration: DAY * 182,
  },
  '1Y': {
    resolution: 604800,
    limit: 365,
    duration: DAY * 365,
  },
};
