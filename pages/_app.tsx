import '../styles/globals.css';
import React, { useEffect } from 'react';

import dynamic from 'next/dynamic';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { Layout } from '../components/layout/Layout';
import { LoaderTheme } from '../components/loaders/LoaderTheme';
import SardineEmbed from '../components/sardine/SardineEmbed';
import { UserProvider } from '../lib/auth-token-context';
import { BRAND_NAME } from '../lib/constants';
import { refreshDarkMode } from '../lib/dark-mode';

import type { CustomPage } from '../lib/types';
import type { AppProps } from 'next/app';

const queryClient = new QueryClient();

function defaultLayout(Component: CustomPage, pageProps: any) {
  return (
    <Layout showFooter={Component.showFooter}>
      <Component {...pageProps} />
    </Layout>
  );
}

const DynamicGlobalModals = dynamic(
  () =>
    import('../components/global-modals/GlobalModals').then(
      (mod) => mod.GlobalModals as any
    ),
  {
    loading: () => <div />,
    ssr: false,
  }
);

type CustomAppProps = AppProps & {
  Component: CustomPage;
};

function MyApp({ Component, pageProps }: CustomAppProps) {
  const getLayout = Component.getLayout ?? defaultLayout;

  useEffect(() => {
    refreshDarkMode();
  }, []);

  return (
    <>
      <Head>
        <title>{BRAND_NAME}</title>
        <meta name="description" content={BRAND_NAME} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <Toaster />

        <UserProvider>
          <SardineEmbed />
          <LoaderTheme>
            <DynamicGlobalModals />
            {getLayout(Component, pageProps)}
          </LoaderTheme>
        </UserProvider>

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
