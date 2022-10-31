export type WithdrawResponse = {
  coin: string;
  address: string;
  tag: string | null;
  fee: number;
  id: number;
  size: string;
  status: string;
  time: string;
  txid: string;
};

export type WithdrawTransaction = {
  id: number;
  coin: string;
  address: string;
  tag: string | null;
  fee: number;
  size: number;
  status: string;
  time: string;
  txid: string;
  notes: string;
  proposedTransferId: string | null;
  destinationEmail: string;
};

export type WithdrawLimits = {
  threshold: number | null;
  volume: number | null;
  transferVolume: number | null;
  highVolumeThreshold: number | null;
  exhausted: number | null;
  thresholdGivenAchDeposits: number | null;
  recentlyDepositedViaAch: number;
  thresholdGivenNotYetWithdrawable: number | null;
  notYetWithdrawable: number;
  cardsWithdrawableAfterCreditedDays: number;
  achWithdrawableAfterCreditedDays: number;
  ftxpayEarlySpendable: number;
  cryptoWithdrawalsPreventedUntil: number | null;
  cryptoWithdrawalsPreventedReason: number | null;
  cryptoWithdrawalsPreventedCoins: number | null;
  lifetimeThreshold: number | null;
  lifetimeExhausted: number | null;
  maxSingleAchWithdrawalSize: number;
  pendingAchWithdrawalSize: number;
  maxPendingAchWithdrawalSize: number;
  minSingleAchWithdrawalSizeAfterFees: number;
  predictedAchWithdrawalFees: number;
  feesWaivedForNextAchWithdrawal: boolean;
};

export type WithdrawalFee = {
  method: string;
  fee: number;
  congested: boolean;
};
