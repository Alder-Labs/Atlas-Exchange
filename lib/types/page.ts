import { ReactElement, ReactNode } from 'react';

import { NextPage } from 'next';
import { AppProps } from 'next/app';

import { AuthLevel } from './auth-level';

// Pages can state if they need to be authenticated
export type CustomPage<P = Record<string, unknown>> = NextPage<P> & {
  getLayout?: (
    Component: CustomPage,
    pageProps: AppProps['pageProps']
  ) => ReactNode;
  requiredAuthLevel?: AuthLevel;
  showFooter?: boolean;
};
