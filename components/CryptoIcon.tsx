import clsx from 'clsx';

import { COIN_ICONS, FIAT_CURRENCY } from '../lib/crypto-icons';

interface CryptoIcon {
  className?: string;
  coinId: string;
}
export function CryptoIcon(props: CryptoIcon) {
  const { className, coinId } = props;

  const icon = COIN_ICONS[coinId] ?? FIAT_CURRENCY;

  if (!icon) {
    return (
      <div
        className={clsx(
          'shrink-0 select-none rounded-full bg-grayLight-40 dark:bg-grayDark-50',
          className
        )}
      />
    );
  }
  return (
    <img
      draggable={false}
      className={clsx({
        'shrink-0 overflow-hidden rounded-full': true,
        [`${className}`]: true,
      })}
      alt={`${coinId} Icon`}
      src={COIN_ICONS[coinId] ?? FIAT_CURRENCY}
    />
  );
}
