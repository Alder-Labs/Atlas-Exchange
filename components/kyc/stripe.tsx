import { loadStripe } from "@stripe/stripe-js";

import { requireEnvVar } from "../../lib/env";

const STRIPE_PUBLIC_KEY = requireEnvVar("NEXT_PUBLIC_STRIPE_PUBLIC_KEY");

export const getStripe = async () => {
  return await loadStripe(STRIPE_PUBLIC_KEY);
};
