const ENV_VARS = {
  NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY:
    process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY,
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
};

type EnvVar = keyof typeof ENV_VARS;

export function requireEnvVar(key: EnvVar): string {
  const value = ENV_VARS[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}
