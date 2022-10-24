import { MfaType } from './signin';

interface Position {}

export type Account = {
  accountIdentifier: number;
  username: string;
  collateral: number;
  freeCollateral: number;
  totalAccountValue: number;
  totalPositionSize: number;
  initialMarginRequirement: number;
  maintenanceMarginRequirement: number;
  marginFraction: number | null;
  openMarginFraction: number | null;
  liquidating: boolean;
  backstopProvider: boolean;
  positions: Position[];
  takerFee: number;
  makerFee: number;
  leverage: number;
  futuresLeverage: number;
  positionLimit: number | null;
  positionLimitUsed: number | null;
  useFttCollateral: boolean;
  chargeInterestOnNegativeUsd: boolean;
  spotMarginEnabled: boolean;
  spotMarginWithdrawalsEnabled: boolean;
  spotLendingEnabled: boolean;
  accountType: null;
};

export type User = {
  mobileHasDeposited: null;
  mobileHasTraded: null;
  agreedToTrumpExtension: null;
  coachellaPurchaseAgreement: null;
  defaultFiat: null;
  agreedToMarginAndLocAgreement: null;
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
  referralCode: number;
  referred: boolean;
  referrerId: null;
  vip: number;
  vipManualMinimum: number;
  mmManualMinimum: number;
  mmLevel: number;
  feeTier: number;
  ftt: number;
  jurisdiction: null;
  appliedJurisdiction: null;
  monthlyVolume: number;
  monthlyMakerVolume: number;
  monthlyLtVolume: number;
  monthlyLeveragedTokenCreationVolume: number;
  monthlyLeveragedTokenRedemptionVolume: number;
  dailyVolume: number;
  dailyMakerVolume: number;
  dailyLeveragedTokenCreationVolume: number;
  dailyLeveragedTokenRedemptionVolume: number;
  mfa: MfaType;
  requireMfaForWithdrawals: boolean;
  requireWithdrawalPassword: boolean;
  requireWhitelistedWithdrawals: boolean;
  whitelistedAddressDelayDays: null;
  randomSlug: string;
  showInLeaderboard: boolean;
  useRealNameInLeaderboard: boolean;
  chatUserId: null;
  useBodPriceChange: boolean;
  confirmTrades: boolean;
  cancelAllOrdersButtonEnabled: boolean;
};

export type LoginStatus = {
  loggedIn: boolean;
  account: Account | null;
  user: User | null;
  subaccount: null;
  country: string;
  state: string;
  supportOnly: boolean;
  mfaRequired: MfaType;
  requiresEmailLink: boolean;
  jurisdictionRestriction: string | null;
  maxLeverage: null;
  mfa: MfaType;
  readOnly: false;
  restrictedToSubaccount: boolean;
  withdrawalEnabled: boolean;
  internalTransfersEnabled: boolean;
  onlyAllowSupportOnly: boolean;
  nftTradingEnabled: boolean;
};

export type AccountReduced = Omit<
  Account,
  | 'leverage'
  | 'collateral'
  | 'freeCollateral'
  | 'initialMarginRequirement'
  | 'maintenanceMarginRequirement'
  | 'marginFraction'
  | 'openMarginFraction'
  | 'liquidating'
  | 'backstopProvider'
  | 'futuresLeverage'
  | 'useFttCollateral'
  | 'chargeInterestOnNegativeUsd'
  | 'spotMarginEnabled'
  | 'spotMarginWithdrawalsEnabled'
  | 'spotLendingEnabled'
  | 'liquidating'
>;

export type UserReduced = Omit<
  User,
  | 'agreedToMarginAndLocAgreement'
  | 'referralCode'
  | 'referred'
  | 'referrerId'
  | 'vip'
  | 'vipManualMinimum'
  | 'mmManualMinimum'
  | 'mmLevel'
  | 'feeTier'
  | 'ftt'
  | 'monthlyVolume'
  | 'monthlyMakerVolume'
  | 'monthlyLtVolume'
  | 'monthlyLeveragedTokenCreationVolume'
  | 'monthlyLeveragedTokenRedemptionVolume'
  | 'dailyVolume'
  | 'dailyMakerVolume'
  | 'dailyLeveragedTokenCreationVolume'
  | 'dailyLeveragedTokenRedemptionVolume'
  | 'showInLeaderboard'
  | 'useRealNameInLeaderboard'
  | 'cancelAllOrdersButtonEnabled'
>;

export type LoginStatusReduced = Omit<
  LoginStatus,
  | 'restrictedToSubaccount'
  | 'internalTransfersEnabled'
  | 'onlyAllowSupportOnly'
  | 'maxLeverage'
  | 'supportOnly'
  | 'subaccount'
  | 'user'
  | 'account'
> & { user: UserReduced | null; account: AccountReduced | null };
