import { MfaType } from './signin';

interface Position {}

export type Account = {
  accountIdentifier: number;
  accountType: null;
  backstopProvider: boolean;
  chargeInterestOnNegativeUsd: boolean;
  collateral: number;
  freeCollateral: number;
  futuresLeverage: number;
  initialMarginRequirement: number;
  leverage: number;
  liquidating: boolean;
  maintenanceMarginRequirement: number;
  makerFee: number;
  marginFraction: number | null;
  openMarginFraction: number | null;
  positionLimit: number | null;
  positionLimitUsed: number | null;
  positions: Position[];
  spotLendingEnabled: boolean;
  spotMarginEnabled: boolean;
  spotMarginWithdrawalsEnabled: boolean;
  takerFee: number;
  totalAccountValue: number;
  totalPositionSize: number;
  useFttCollateral: boolean;
  username: string;
};

export type User = {
  agreedToMarginAndLocAgreement: string | null;
  agreedToTrumpExtension: string | null;
  appliedJurisdiction: string | null;
  cancelAllOrdersButtonEnabled: boolean;
  canOtcTradeOptions: boolean;
  chatApp: string | null;
  chatHandle: string | null;
  chatUserId: string | null;
  coachellaPurchaseAgreement: string | null;
  confirmTrades: boolean;
  dagStatus: string | null;
  dailyLeveragedTokenCreationVolume: number;
  dailyLeveragedTokenRedemptionVolume: number;
  dailyLocInterestRate: number;
  dailyMakerVolume: number;
  dailyVolume: number;
  defaultFiat: string | null;
  demo: string | null;
  displayName: string;
  email: string;
  feeTier: number;
  fiatVerified: boolean;
  ftt: number;
  hkClientType: string | null;
  hkStatusMobile: string | null;
  hkStatus: string | null;
  japanKycStatus: string | null;
  jurisdiction: string | null;
  kycApplicationStatus: string;
  kycLevel: number;
  kycName: string;
  kycType: string;
  language: string;
  mfa: MfaType;
  mid: string;
  mmLevel: number;
  mmManualMinimum: number;
  mobileHasDeposited: string | null;
  mobileHasTraded: string | null;
  monthlyLeveragedTokenCreationVolume: number;
  monthlyLeveragedTokenRedemptionVolume: number;
  monthlyLtVolume: number;
  monthlyMakerVolume: number;
  monthlyVolume: number;
  neverRequireEmailLinks: boolean;
  nuveiPofRejected: boolean;
  nuveiUploadedPof: boolean;
  optionsEnabled: boolean;
  originCode: string | null;
  paidNftListingFee: string | null;
  passedLtQuiz: boolean;
  randomSlug: string;
  referralCode: number;
  referred: boolean;
  referrerId: string | null;
  requireMfaForWithdrawals: boolean;
  requireWhitelistedWithdrawals: boolean;
  requireWithdrawalPassword: boolean;
  showInLeaderboard: boolean;
  smallOrderLimitMinimum: number | null;
  smallOrderMultiplier: number | null;
  stocksWhitelistedInsto: string | null;
  tinAttempted: boolean;
  ukClientType: string | null;
  ukClientTypeResponse: string | null;
  useBodPriceChange: boolean;
  useRealNameInLeaderboard: boolean;
  verifiedPhone: boolean;
  vip: number;
  vipManualMinimum: number;
  whitelabelUser: boolean;
  whitelistedAddressDelayDays: number | null;
  whitelistedSeller: boolean;
};

type LoginStatusShared = {
  country: string;
  internalTransfersEnabled: boolean;
  jurisdictionRestriction: string | null;
  maxLeverage: null;
  mfa: MfaType;
  mfaRequired: MfaType;
  nftTradingEnabled: boolean;
  onlyAllowSupportOnly: boolean;
  readOnly: false;
  requiresEmailLink: boolean;
  restrictedToSubaccount: boolean;
  state: string;
  subaccount: null;
  supportOnly: boolean;
  withdrawalEnabled: boolean;
};

export type LoginStatus = (
  | {
      loggedIn: false;
      account: null;
      user: null;
    }
  | {
      loggedIn: true;
      account: Account;
      user: User;
    }
) &
  LoginStatusShared;

export type AccountReduced = Pick<
  Account,
  | 'accountIdentifier'
  | 'accountType'
  | 'makerFee'
  | 'positions'
  | 'takerFee'
  | 'totalAccountValue'
  | 'totalPositionSize'
  | 'username'
>;

export type UserReduced = Pick<
  User,
  | 'agreedToTrumpExtension'
  | 'appliedJurisdiction'
  | 'coachellaPurchaseAgreement'
  | 'confirmTrades'
  | 'dagStatus'
  | 'defaultFiat'
  | 'displayName'
  | 'email'
  | 'feeTier'
  | 'fiatVerified'
  | 'kycApplicationStatus'
  | 'kycLevel'
  | 'kycName'
  | 'kycType'
  | 'language'
  | 'mfa'
  | 'mid'
  | 'mobileHasDeposited'
  | 'mobileHasTraded'
  | 'randomSlug'
  | 'requireMfaForWithdrawals'
  | 'requireWhitelistedWithdrawals'
  | 'requireWithdrawalPassword'
  | 'useBodPriceChange'
  | 'verifiedPhone'
  | 'whitelabelUser'
  | 'whitelistedAddressDelayDays'
  | 'whitelistedSeller'
>;

type LoginStatusSharedReduced = Pick<
  LoginStatusShared,
  | 'country'
  | 'jurisdictionRestriction'
  | 'mfa'
  | 'mfaRequired'
  | 'nftTradingEnabled'
  | 'onlyAllowSupportOnly'
  | 'readOnly'
  | 'requiresEmailLink'
  | 'supportOnly'
  | 'state'
  | 'withdrawalEnabled'
>;

export type LoginStatusReduced = (
  | {
      loggedIn: false;
      account: null;
      user: null;
    }
  | {
      loggedIn: true;
      account: AccountReduced;
      user: UserReduced;
    }
) &
  LoginStatusSharedReduced;
