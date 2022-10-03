export type DepositAddress = {
  address: string;
  tag: string | null;
  method: string;
  coin: string;
};

export type DepositTransaction = {
  coin: string;
  confirmations: number;
  confirmTime: string;
  fee: number;
  id: number;
  sentTime: string;
  size: string;
  status: string;
  time: string;
  method: string;
  txid: string;
  notes: string;
};

export type DepositLimits = {
  achRecentlyDeposited: number;
  achDepositLimit: number;
  achRecentPeriodDays: number;
  achHaveUnforgivenReversedDeposits: boolean;
  achEarlyCredited: number;
  achEarlyCreditLimit: number;
  achDepositsNoFeesAbove: number;
  achSingleDepositLimit: number;
  achHaveEarlyCreditBlockingFailures: boolean;
  cardRecentPeriodDays: number;
  cardSingleDepositLimit: number;
  cardDepositLimit: number;
  cardRecentlyDeposited: number;
  kyc2CardDepositLimit: number;
  kyc1CardDepositLimit: number;
  haveReversedDeposits: boolean;
  totalPayments: number;
  maxPaymentWithoutMfa: number;
  maxTotalPaymentsWithoutMfa: number;
  totalSmallDeposits: number;
  maxDepositWithoutMfa: number;
  maxTotalDepositsWithoutMfa: number;
};
