import clsx from 'clsx';

import { useBalances } from '../../hooks/wallet';
import { useUserState } from '../../lib/auth-token-context';
import { renderCurrency } from '../../lib/currency';
import { UserStateStatus } from '../../lib/types/user-states';
import { Text } from '../base';

interface AvailableFundsProps {
  coinId: string;
  label: string;
  className?: string;
}

export function AvailableFunds(props: AvailableFundsProps) {
  const { coinId, label, className } = props;

  const userState = useUserState();
  const loggedIn = userState.status === UserStateStatus.SIGNED_IN;

  const {
    balancesMap,
    refetch: refetchBalances,
    isLoading: balancesIsLoading,
    error: balanceError,
  } = useBalances();

  return (
    <div
      className={clsx({
        'w-full': true,
        [`${className}`]: true,
      })}
    >
      <Text color="secondary" size="sm">
        {label}
      </Text>
      <div />
      <div className="flex items-center">
        <Text
          isLoading={loggedIn && balancesIsLoading}
          loadingWidth="10rem"
          className="font-medium"
          size="lg"
        >
          {loggedIn
            ? renderCurrency({
              amount: balancesMap?.[coinId]?.total ?? 0,
              coinId: coinId,
              showCoinId: coinId !== 'USD',
              roundingMode: 'floor',
            })
            : '--'}
        </Text>
      </div>
    </div>
  );
}
