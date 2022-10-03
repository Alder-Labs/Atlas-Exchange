import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? '';

export const getStripe = async () => {
  return await loadStripe(STRIPE_PUBLIC_KEY);
};
