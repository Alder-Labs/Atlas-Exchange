export type CoinId =
  | 'USD'
  | 'TUSD'
  | 'USDC'
  | 'USDP'
  | 'BUSD'
  | 'HUSD'
  | 'BTC'
  | 'USDT'
  | 'ETH'
  | 'BCH'
  | 'LTC'
  | 'PAXG'
  | 'CUSDT'
  | 'SOL'
  | 'EUR'
  | 'GBP'
  | 'AUD'
  | 'HKD'
  | 'CAD'
  | 'CHF'
  | 'WUSDC'
  | 'LINK'
  | 'YFI'
  | 'SUSHI'
  | 'UNI'
  | 'BAT'
  | 'WBTC'
  | 'DOGE'
  | 'BRZ'
  | 'TRX'
  | 'GRT'
  | 'DAI'
  | 'MKR'
  | 'AAVE'
  | 'MATIC'
  | 'PAX'
  | 'MXN'
  | 'SHIB'
  | 'KSHIB'
  | 'AVAX'
  | 'JPY'
  | 'NEAR'
  | 'ALGO'
  | 'GHS';

export type Coin = {
  id: CoinId;
  name: string;
  collateral: boolean;
  usdFungible: boolean;
  isEtf: boolean;
  isToken: boolean;
  hidden: boolean;
  canDeposit: boolean;
  canWithdraw: boolean;
  canConvert: boolean;
  hasTag: boolean;
  collateralWeight: number;
  imfWeight: number;
  spotMarginImf: number;
  spotMarginImfFactor: number;
  fiat: boolean;
  methods: string[];
  erc20Contract: string | null;
  bep2Asset: string | null;
  trc20Contract: string | null;
  splMint: string | null;
  creditTo: null;
  spotMargin: boolean;
  nftQuoteCurrencyEligible: boolean;
  indexPrice: number;
  imageUrl: string | null;
};
