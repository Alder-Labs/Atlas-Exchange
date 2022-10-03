import React, { forwardRef } from 'react';

import { useRouter } from 'next/router';

import { Coin } from '../../lib/types';
import { CoinSelector } from '../trade/CoinSelector';

interface DepositCryptoMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelectCoinId: (coinId: string) => void;
  filter: (coin: Coin) => boolean;
}

export const CryptoSelectMenu = forwardRef<
  HTMLDivElement,
  DepositCryptoMenuProps
>((props, ref) => {
  const { onSelectCoinId, filter } = props;
  return (
    <div>
      <CoinSelector
        className="bg-inherit"
        onChange={onSelectCoinId}
        filter={filter}
      />
    </div>
  );
});

CryptoSelectMenu.displayName = 'CryptoSelectMenu';

export default CryptoSelectMenu;
