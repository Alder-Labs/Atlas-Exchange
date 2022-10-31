import { HTMLAttributes } from 'react';

import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';

import { Text } from '../base';
import { CryptoIcon } from '../CryptoIcon';

interface CoinButtonProps extends HTMLAttributes<HTMLDivElement> {
  coinId: string;
}

export function CoinButton(props: CoinButtonProps) {
  const { coinId, ...rest } = props;

  const primaryButtonStyle = clsx({
    ['dark:hover:bg-grayDark-10 rounded-lg border p-2 py-2.5 shrink-0 w-full']:
      true,
    ['transition hover:bg-grayLight-20 border-grayLight-40 dark:border-grayDark-50 dark:bg-black']:
      true,
    ['w-full']: true,
  });

  return (
    <div {...rest} className={primaryButtonStyle}>
      <div className="flex items-center justify-between text-black dark:text-grayDark-100">
        <div className="flex items-center">
          <CryptoIcon coinId={coinId} className="mr-2 h-5 w-5"></CryptoIcon>
          <Text size="sm" isLoading={!coinId} loadingWidth="2rem">
            {coinId}
          </Text>
        </div>
        <FontAwesomeIcon
          icon={faChevronDown}
          className="mr-1 h-2.5 w-2.5 shrink-0"
        />
      </div>
    </div>
  );
}
