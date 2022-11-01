import React, { useMemo } from 'react';

import { BuyingPowerPrompt } from '../components/home/BuyingPowerPrompt';
import { DepositPrompt } from '../components/home/DepositPrompt';
import { MarketWatchlist } from '../components/home/MarketWatchlist';
import { OnboardingPrompt } from '../components/home/OnboardingPrompt';
import { SignupPrompt } from '../components/home/SignupPrompt';
import { TopMovers } from '../components/home/TopMovers';
import { Responsive } from '../components/layout/Responsive';
import { SidePadding } from '../components/layout/SidePadding';
import { BuySellConvert } from '../components/trade/BuySellConvert';
import { useBalances } from '../hooks/wallet/useBalances';
import { useUserState } from '../lib/auth-token-context';
import { CustomPage } from '../lib/types';
import { UserStateStatus } from '../lib/types/user-states';

enum HomePromptType {
  LOADING,
  SIGNUP,
  ONBOARDING,
  DEPOSIT,
  BUYING_POWER,
}

const Home: CustomPage = () => {
  const userState = useUserState();
  const loginStatus = userState.loginStatusData;

  const { balancesMap } = useBalances({
    enabled: loginStatus?.loggedIn ?? false,
    refetchOnWindowFocus: false,
  });

  const renderHomePrompt = useMemo(() => {
    if (userState.status === UserStateStatus.SIGNED_OUT) {
      return <SignupPrompt />;
    } else if (userState.loginStatusData?.user?.kycLevel === 0) {
      return <OnboardingPrompt />;
    } else if (!balancesMap?.['USD']?.total) {
      return <DepositPrompt />;
    } else {
      return <BuyingPowerPrompt amount={balancesMap?.['USD'].total ?? 0} />;
    }
  }, [
    balancesMap,
    userState.loginStatusData?.user?.kycLevel,
    userState.status,
  ]);

  return (
    <>
      <SidePadding className="grow">
        <div className="flex w-full grow flex-col-reverse items-start overflow-x-auto lg:flex-row">
          <div className="h-full flex-col">
            <Responsive showIfLargerThan="lg">
              <div className="py-8 sm:p-8">{renderHomePrompt}</div>
            </Responsive>
            <div className="h-[2px] shrink-0 self-stretch bg-grayLight-10 dark:bg-grayDark-50 sm:ml-8"></div>
            <div className="flex-1 py-8 sm:p-8">
              <MarketWatchlist />
            </div>
          </div>

          <div className="my-8 hidden w-[2px] shrink-0 self-stretch bg-grayLight-10 dark:bg-grayDark-50 sm:block"></div>

          <div className="w-full shrink-0 lg:w-80">
            <Responsive showIfSmallerThan="lg">
              <div className="w-full py-8 sm:p-8">{renderHomePrompt}</div>
              <div className="h-[2px] shrink-0 self-stretch bg-grayLight-10 dark:bg-grayDark-50"></div>
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

            <div className="h-[2px] shrink-0 self-stretch bg-grayLight-10 dark:bg-grayDark-50 sm:mr-8"></div>

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
