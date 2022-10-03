export type UsdValueHistory = {
  now: string;
  value: number;
  records: UsdValueSnapshot[];
};

export type UsdValueSnapshot = {
  usdValue: number;
  time: string;
};
