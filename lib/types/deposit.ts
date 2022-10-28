export type DepositAddress = {
  address: string;
  tag: string | null;
  method: string;
  coin: string;
};

export type DepositTransaction =
  | {
      id: number;
      coin: string;
      size: number | null;
      status: string;
      time: string;
      confirmedTime: string | null;
      uploadedFile: string | null;
      uploadedFileName: string | null;
      cancelReason: string;
      fiat: true;
      ach: boolean;
      type: string;
      supportTicketId: number | null;
    }
  | {
      id: number;
      coin: string;
      size: number | null;
      time: string;
      notes: string | null;
      status: string;
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
