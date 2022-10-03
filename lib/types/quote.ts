export type Quote = {
  baseCoin: string;
  cost: number;
  expired: boolean;
  expiry: number;
  filled: boolean;
  fromCoin: string;
  id: number;
  price: number;
  proceeds: number;
  quoteCoin: string;
  side: string;
  toCoin: string;
};

export type Fill = {
  id: number;
  market: null;
  future: null;
  baseCurrency: string;
  quoteCurrency: string;
  type: string;
  side: string;
  price: number;
  size: number;
  orderId: null;
  time: string;
  tradeId: null;
  feeRate: number;
  fee: number;
  feeCurrency: string;
  liquidity: string;
};
