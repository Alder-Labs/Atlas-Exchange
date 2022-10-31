import toast from 'react-hot-toast';

import { useBalances } from '../../hooks/wallet/useBalances';
import { Button } from '../base';

interface ConvertAllButtonProps {
  coinId: string;
  onAmountChosen: (amount: string) => void;
  disabled?: boolean;
  className?: string;
  buttonText?: string;
}

export function ConvertAllButton(props: ConvertAllButtonProps) {
  const { onAmountChosen, disabled, className, coinId, buttonText } = props;

  const { balancesMap } = useBalances();

  const handleClick = () => {
    const usdBalance = balancesMap?.[coinId]?.total;
    if (!usdBalance) {
      toast.error('No buying power. Deposit funds to start trading!');
      return;
    }

    onAmountChosen(usdBalance.toString());
  };

  const isDisabled = disabled || !balancesMap?.[coinId]?.total;

  return (
    <Button
      size="sm"
      className={className}
      disabled={isDisabled}
      variant="secondary"
      onClick={handleClick}
    >
      {buttonText ?? 'Convert all'}
    </Button>
  );
}
