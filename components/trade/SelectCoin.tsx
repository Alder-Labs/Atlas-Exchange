import { useCallback } from 'react';

import clsx from 'clsx';

import { Text } from '../base';
import { Popover } from '../base/Popover';

import { CoinButton } from './CoinButton';
import { CoinSelector } from './CoinSelector';

interface SelectCoinAltProps {
  coinId: string | null;
  onCoinIdChange: (coinId: string) => void;

  label: string;
  className?: string;
}

export function SelectCoin(props: SelectCoinAltProps) {
  const { coinId, onCoinIdChange, label, className } = props;

  const styles = clsx({
    'w-full outline-none': true,
    [`${className}`]: true,
  });

  const renderPanel = useCallback(
    ({ close }: { close: () => void }) => {
      return (
        <div className="dark:bg-grayDark-20 absolute left-0 flex w-full flex-col rounded-xl bg-white py-4 shadow-lg">
          <CoinSelector
            className="w-full shrink-0"
            filter={(coin) => !coin.fiat && coin.canConvert}
            selectedCoinId={coinId ?? undefined}
            onChange={(newCoinId) => {
              close();
              onCoinIdChange(newCoinId);
            }}
          />
        </div>
      );
    },
    [coinId, onCoinIdChange]
  );

  return (
    <div className="w-full">
      <div className="flex justify-start">
        <Text size="sm" color="secondary">
          {label}
        </Text>
      </div>
      <div className="h-1"></div>
      <Popover className={styles} renderPanel={renderPanel}>
        <Popover.Button className="w-full outline-none">
          <CoinButton coinId={coinId ?? ''}></CoinButton>
        </Popover.Button>
      </Popover>
    </div>
  );
}
