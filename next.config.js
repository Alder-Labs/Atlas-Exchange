/** @type {import('next').NextConfig} */

const { withSentryConfig } = require("@sentry/nextjs");

// - prevent iframe embedding except from Plaid and Stripe
// - only allow scripts from the same origin, Plaid, Stripe, or Sardine

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com *.plaid.com *.sardine.ai https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
  frame-src *.stripe.com *.plaid.com https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/;
  font-src 'self' https://fonts.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL} *.sardine.ai *.stripe.com *.plaid.com *.sentry.io;
  img-src 'self' data: ftx.us *.stripe.com *.plaid.com;
  prefetch-src 'self' *.plaid.com;
`;

const securityHeaders = [
  {
    // Enable HSTS - Http Strict Transport Security
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    // Prevent Clickjacking by preventing the page from being loaded in an iframe
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    // Prevent MIME type sniffing by telling the browser to only use the declared content type
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // CSP Header - https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "deny",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
];

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    legacyBrowsers: false,
    browsersListForSwc: true,
    images: {
      unoptimized: true,
      allowFutureImage: true,
    },
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in the application
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  sentry: {
    // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
    // for client-side builds. (This will be the default starting in
    // `@sentry/nextjs` version 8.0.0.) See
    // https://webpack.js.org/configuration/devtool/ and
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
    // for more information.
    hideSourceMaps: true,

    // This option will automatically provide performance monitoring for Next.js
    // data-fetching methods and API routes, making the manual wrapping of API
    // routes via `withSentry` redundant.
    autoInstrumentServerFunctions: true,
  },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

const withAnalyzer = withBundleAnalyzer(nextConfig);
module.exports = withSentryConfig(withAnalyzer, sentryWebpackPluginOptions);
