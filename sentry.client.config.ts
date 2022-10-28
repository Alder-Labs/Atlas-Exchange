// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import { requireEnvVar } from './lib/env';

const SENTRY_DSN = requireEnvVar('NEXT_PUBLIC_SENTRY_DSN');
const ENVIRONMENT = requireEnvVar('NEXT_PUBLIC_ENVIRONMENT');

Sentry.init({
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT === 'production' ? 'production' : 'development',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps
});
