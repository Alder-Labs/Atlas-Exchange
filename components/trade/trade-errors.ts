export type TradeError =
  | { type: 'not-logged-in' }
  | { type: 'not-enough-funds' }
  | { type: 'needs-mfa' }
  | { type: 'needs-kyc-2' }
  | {
      type: 'other';
      message: string;
    };

export function getTradeError(error: Error): TradeError {
  const msg = error.message;
  if (msg.includes('Not logged in')) {
    return { type: 'not-logged-in' };
  } else if (msg.includes('Not enough balances')) {
    return { type: 'not-enough-funds' };
  } else if (msg.includes('Please enable 2FA')) {
    return { type: 'needs-mfa' };
  } else if (msg.includes('Please complete level 2 Identity Verification')) {
    return { type: 'needs-kyc-2' };
  } else {
    return { type: 'other', message: msg };
  }
}
