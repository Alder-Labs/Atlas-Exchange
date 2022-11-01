import clsx from 'clsx';
import toast from 'react-hot-toast';

import { useAuthStatus, AuthStatus } from '../../hooks/kyc';
import { useBalances } from '../../hooks/wallet';
import { Button } from '../base';

import { useRedirectHandlers } from './useRedirectHandlers';

interface ConvertPercentageButtonsProps {
  onAmountChosen: (amount: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ConvertPercentageButtons(props: ConvertPercentageButtonsProps) {
  const { onAmountChosen, disabled, className } = props;

  const { balancesMap, isLoading: balancesIsLoading } = useBalances();

  const { authStatus } = useAuthStatus();
  const isDisabled =
    disabled || balancesIsLoading || authStatus === AuthStatus.Loading;

  const { requireAuthStatus } = useRedirectHandlers();

  const createTopUpHandler = (fraction: number) => () => {
    if (!requireAuthStatus(AuthStatus.KycLevel2)) {
      return;
    }

    const usdBalance = balancesMap?.['USD']?.total;
    if (!usdBalance) {
      toast.error('No buying power. Deposit funds to start trading!');
      return;
    }

    const floored = Math.floor(usdBalance * 100) / 100;

    const amt = (floored * fraction).toFixed(2);
    onAmountChosen(amt);
  };

  const styles = clsx({
    'flex w-full items-center justify-between gap-2': true,
    [`${className}`]: true,
  });

  return (
    <div className={styles}>
      <Button
        size="sm"
        disabled={isDisabled}
        variant="secondary"
        onClick={createTopUpHandler(0.25)}
      >
        &nbsp;&nbsp;25%&nbsp;&nbsp;
      </Button>
      <Button
        size="sm"
        disabled={isDisabled}
        variant="secondary"
        onClick={createTopUpHandler(0.5)}
      >
        &nbsp;&nbsp;50%&nbsp;&nbsp;
      </Button>

      <Button
        size="sm"
        disabled={isDisabled}
        variant="secondary"
        onClick={createTopUpHandler(1.0)}
      >
        &nbsp;&nbsp;100%&nbsp;&nbsp;
      </Button>
    </div>
  );
}
