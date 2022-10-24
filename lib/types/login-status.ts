import { MfaType } from './signin';

interface Position {}

export type Account = {
  accountIdentifier: number;
  username: string;
  totalAccountValue: number;
  totalPositionSize: number;
  positions: Position[];
  takerFee: number;
  makerFee: number;
  positionLimit: number | null;
  positionLimitUsed: number | null;
  accountType: null;
};

export type User = {
  mobileHasDeposited: null;
  mobileHasTraded: null;
  agreedToTrumpExtension: null;
  coachellaPurchaseAgreement: null;
  defaultFiat: null;
  ukClientTypeResponse: null;
  paidNftListingFee: null;
  hkClientType: null;
  displayName: string;
  fiatVerified: boolean;
  email: string;
  mid: string;
  kycApplicationStatus: string;
  kycLevel: number;
  kycType: null;
  kycName: null;
  feeTier: number;
  jurisdiction: null;
  appliedJurisdiction: null;
  mfa: MfaType;
  requireMfaForWithdrawals: boolean;
  requireWithdrawalPassword: boolean;
  requireWhitelistedWithdrawals: boolean;
  whitelistedAddressDelayDays: null;
  randomSlug: string;
  chatUserId: null;
  useBodPriceChange: boolean;
  confirmTrades: boolean;
};

export type LoginStatus = {
  loggedIn: boolean;
  account: Account | null;
  user: User | null;
  country: string;
  state: string;
  mfaRequired: MfaType;
  requiresEmailLink: boolean;
  jurisdictionRestriction: string | null;
  mfa: MfaType;
  readOnly: false;
  withdrawalEnabled: boolean;
  nftTradingEnabled: boolean;
};
