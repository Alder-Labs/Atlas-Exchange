import React, { useRef, useState } from 'react';

import { Tab } from '@headlessui/react';
import clsx from 'clsx';
import { useRouter } from 'next/router';

import { Responsive } from '../components/layout/Responsive';
import { SidePadding } from '../components/layout/SidePadding';
import { BuySellConvert } from '../components/trade/BuySellConvert';
import { WalletBalances } from '../components/wallet/Balances';
import DepositTransactions from '../components/wallet/Deposits';
import { PortfolioPerformance } from '../components/wallet/PortfolioPerformance';
import TradeTransactions from '../components/wallet/Trades';
import WithdrawTransactions from '../components/wallet/Withdrawals';
import { useUserState } from '../lib/auth-token-context';
import { CustomPage } from '../lib/types';

import type { NextPage } from 'next';

enum TabType {
  Balances = 'Balances',
  Trades = 'Trades',
  Deposits = 'Deposits',
  Withdrawals = 'Withdrawals',
}

const ALL_TABS = Object.values(TabType);

const Wallet: CustomPage = () => {
  const userState = useUserState();

  const router = useRouter();
  const tab = (router.query.tab ?? TabType.Balances) as TabType;

  const setTab = (tab: TabType) => {
    router.push(
      {
        pathname: '/wallet',
        query: { tab },
      },
      undefined,
      { scroll: false }
    );
  };

  const [tradeDefaults, setTradeDefaults] = useState<{
    fromCoinId?: string;
    fromAmount?: string;
    toCoinId?: string;
    toAmount?: string;
  }>({
    fromCoinId: 'USD',
    fromAmount: '',
    toCoinId: 'BTC',
    toAmount: '',
  });

  const getBtnStyle = (btnTab: TabType) => {
    return clsx({
      'py-4 px-4 border-b-4 text-lg outline-none select-none translate-y-[2px] font-medium':
        true,
      'border-textAccent text-textAccent': tab === btnTab,
      'border-transparent text-grayLight-70': tab !== btnTab,
    });
  };

  return (
    <>
      <SidePadding className="grow">
        <div className="flex w-full grow flex-col items-start lg:flex-row">
          <div className="w-full">
            <div className="pt-8 pb-0 sm:px-8">
              <PortfolioPerformance />
            </div>

            <div className="flex-1 dark:bg-black sm:pl-8">
              <Tab.Group
                selectedIndex={ALL_TABS.indexOf(tab)}
                onChange={(idx) => {
                  setTab(ALL_TABS[idx]);
                }}
              >
                <div className="mb-4 w-full overflow-x-auto">
                  <div className="inline-block min-w-full">
                    <Tab.List className="mb-4 flex min-w-full flex-nowrap gap-6 border-b-2 border-grayLight-10 dark:border-grayDark-50">
                      <Tab className={getBtnStyle(TabType.Balances)}>
                        Assets
                      </Tab>
                      <Tab className={getBtnStyle(TabType.Trades)}>Trades</Tab>
                      <Tab className={getBtnStyle(TabType.Deposits)}>
                        Deposits
                      </Tab>
                      <Tab className={getBtnStyle(TabType.Withdrawals)}>
                        Withdrawals
                      </Tab>
                    </Tab.List>
                  </div>
                </div>
                <Tab.Panels className="outline-none sm:mr-8">
                  <Tab.Panel className="outline-none">
                    <WalletBalances
                      onClickBuy={(market) => {
                        setTradeDefaults({
                          fromCoinId: market.quoteCurrency,
                          fromAmount: '',
                          toCoinId: market.baseCurrency,
                          toAmount: '',
                        });
                      }}
                    />
                  </Tab.Panel>
                  <Tab.Panel className="outline-none">
                    <TradeTransactions />
                  </Tab.Panel>
                  <Tab.Panel className="outline-none">
                    <DepositTransactions />
                  </Tab.Panel>
                  <Tab.Panel className="outline-none">
                    <WithdrawTransactions />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>
          </div>

          <div className="my-8 hidden w-[2px] shrink-0 self-stretch bg-grayLight-10 dark:bg-grayDark-50 sm:block"></div>

          <div className="w-full shrink-0 lg:w-80">
            <Responsive showIfSmallerThan="lg">
              <div className="h-8" />
              <div className="h-[2px] shrink-0 self-stretch bg-grayLight-10 dark:bg-grayDark-50"></div>
            </Responsive>
            <div className="flex w-full flex-col items-start py-8 sm:p-8">
              <BuySellConvert />
            </div>
          </div>
        </div>
        <div className="h-24" />
      </SidePadding>
    </>
  );
};

export default Wallet;
