import React, { useMemo, useRef, useState } from 'react';

import { NextPage } from 'next';

import { BuyingPowerPrompt } from '../components/home/BuyingPowerPrompt';
import { DepositPrompt } from '../components/home/DepositPrompt';
import { MarketWatchlist } from '../components/home/MarketWatchlist';
import { OnboardingPrompt } from '../components/home/OnboardingPrompt';
import { SignupPrompt } from '../components/home/SignupPrompt';
import { TopMovers } from '../components/home/TopMovers';
import { Responsive } from '../components/layout/Responsive';
import { SidePadding } from '../components/layout/SidePadding';
import { LoaderTripleLine } from '../components/loaders/LoaderTripleLine';
import { BuySellConvert } from '../components/trade/BuySellConvert';
import { useBalances } from '../hooks/useBalances';
import { useLoginStatus } from '../hooks/useLoginStatus';

enum HomePromptType {
  LOADING,
  SIGNUP,
  ONBOARDING,
  DEPOSIT,
  BUYING_POWER,
}

const Home: NextPage = () => {
  const { data: loginStatus } = useLoginStatus();

  const { balancesMap } = useBalances({
    enabled: loginStatus?.loggedIn ?? false,
    refetchOnWindowFocus: false,
  });

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

  const updateTradeProps = (props: {
    fromCoinId?: string;
    fromAmount?: string;
    toCoinId?: string;
    toAmount?: string;
  }) => {
    setTradeDefaults(props);
    tradeRef.current?.focus();
  };
  const tradeRef = useRef<HTMLInputElement>(null);

  // const { ref, dimElement, focused, setFocused } = useDimSurroundings();

  const renderHomePrompt = useMemo(() => {
    const promptType: HomePromptType = !loginStatus
      ? HomePromptType.LOADING
      : !loginStatus.loggedIn
      ? HomePromptType.SIGNUP
      : loginStatus.loggedIn && loginStatus.user.kycLevel === 0
      ? HomePromptType.ONBOARDING
      : balancesMap?.['USD']?.total ?? 0 > 0
      ? HomePromptType.BUYING_POWER
      : HomePromptType.DEPOSIT;

    switch (promptType) {
      case HomePromptType.LOADING:
        return <LoaderTripleLine />;
      case HomePromptType.SIGNUP:
        return <SignupPrompt />;
      case HomePromptType.ONBOARDING:
        return <OnboardingPrompt />;
      case HomePromptType.DEPOSIT:
        return <DepositPrompt />;
      case HomePromptType.BUYING_POWER:
        return <BuyingPowerPrompt amount={balancesMap?.['USD'].total ?? 0} />;
    }
  }, [balancesMap, loginStatus]);

  return (
    <>
      <SidePadding className="grow">
        <div className="flex w-full grow flex-col-reverse items-start overflow-x-auto lg:flex-row">
          <div className="h-full flex-col">
            <Responsive showIfLargerThan="lg">
              <div className="py-8 sm:p-8">{renderHomePrompt}</div>
            </Responsive>
            <div className="dark:bg-grayDark-50 bg-grayLight-10 h-[2px] shrink-0 self-stretch sm:ml-8"></div>
            <div className="flex-1 py-8 sm:p-8">
              <MarketWatchlist updateTradeProps={updateTradeProps} />
            </div>
          </div>

          <div className="dark:bg-grayDark-50 bg-grayLight-10 my-8 hidden w-[2px] shrink-0 self-stretch sm:block"></div>

          <div className="w-full shrink-0 lg:w-80">
            <Responsive showIfSmallerThan="lg">
              <div className="w-full py-8 sm:p-8">{renderHomePrompt}</div>
              <div className="dark:bg-grayDark-50 bg-grayLight-10 h-[2px] shrink-0 self-stretch"></div>
            </Responsive>
            <div className="flex flex-col items-start py-8 sm:p-8">
              {/* <Trade
                id="trade"
                ref={tradeRef}
                defaults={tradeDefaults}
                focused={focused}
                onFocus={() => {
                  setFocused(true);
                }}
              /> */}
              <BuySellConvert />
            </div>

            <div className="dark:bg-grayDark-50 bg-grayLight-10 h-[2px] shrink-0 self-stretch sm:mr-8"></div>

            <div className="w-full flex-1 py-8 sm:p-8">
              <TopMovers
                filter={(market) => market.quoteCurrency === 'USD'}
                size={6}
              />
            </div>
          </div>
        </div>
      </SidePadding>
      <div className="h-8" />
    </>
  );
};

export default Home;
