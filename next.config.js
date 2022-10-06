/** @type {import('next').NextConfig} */

// - prevent iframe embedding except from Plaid and Stripe
// - only allow scripts from the same origin, Plaid, Stripe, or Sardine

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' *.plaid.com *.sardine.ai *.stripe.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
  frame-src *.plaid.com *.sardine.ai *.stripe.com https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/;
  font-src 'self' https://fonts.gstatic.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL} *.sardine.ai *.stripe.com *.plaid.com;
  img-src 'self' data: ftx.us *.stripe.com *.plaid.com;
  prefetch-src 'self' *.plaid.com;
`;

const securityHeaders = [
  {
    // Enable HSTS - Http Strict Transport Security
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // Prevent Clickjacking by preventing the page from being loaded in an iframe
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    // Prevent MIME type sniffing by telling the browser to only use the declared content type
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // CSP Header - https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'deny',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
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
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer(nextConfig);
