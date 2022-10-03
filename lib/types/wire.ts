export type WireInstruction = {
  instructions: {
    beneficiary: { name: string; value: string }[];
    receiving: { name: string; value: string }[] | null;
  };
  memo: string | null;
  shortMemo: string | null;
};

export type WireRegister = {
  currency: string;
  size: number;
  notes: string;
};

export type WireRegisterResponse = {
  id: number;
  coin: string;
  size: string;
  status: string;
  time: string;
  confirmedTime: string;
  uploadedFile: string | null;
  uploadedFileName: string | null;
  cancelReason: string | null;
  fiat: boolean;
  ach: boolean;
  type: string;
};

export type WireWithdrawalResponse = {
  id: number;
  coin: string;
  address: string;
  notes: string | null;
  size: number;
  bank: string | null;
  bankName: string | null;
  fee: number;
  status: string;
  time: string;
  fiat: boolean;
  isPrimetrust: boolean;
  reversalFee: null | number;
  supportTicketId: number | string;
  accountId: number;
  sentViaFtxGateway: boolean;
  primetrustStatus: string | null;
  primetrustDisbursementId: string | null;
  primetrustNeedsAction: boolean;
  primetrustNeedsGreenlight: boolean;
  automatic: boolean;
  sentViaApi: boolean;
  acknowledgeByBankAt: string | null;
  paymentId: number | null;
  internalNotes: string | null;
  failureReason: string | null;
  errorCode: number | null;
  uploadedFile: null;
  uploadedFileName: null;
  extraBankInfo: null;
  bankAccountNumber: null;
};
