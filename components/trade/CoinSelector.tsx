import React, { forwardRef, useEffect, useMemo, useState } from 'react';

import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Combobox } from '@headlessui/react';
import clsx from 'clsx';

import { useCoins } from '../../hooks/market';
import { useFocusWithin } from '../../hooks/utils';
import { Coin } from '../../lib/types';
import { Text } from '../base';
import { CryptoIcon } from '../CryptoIcon';
import { LoaderIconDoubleLine } from '../loaders';
import { Tooltip } from '../Tooltip';

interface CoinSelectorItemProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  selected?: boolean;
  active?: boolean;
  coin: Coin;
  onClick: () => void;
}

// eslint-disable-next-line react/display-name
const CoinSelectorItem = forwardRef<HTMLButtonElement, CoinSelectorItemProps>(
  (props, ref) => {
    const { leftIcon = null, rightIcon = null, coin, onClick, active } = props;

    const styles = clsx({
      'flex w-full flex-row items-center justify-between py-1.5 px-3': true,
      'outline-none duration-300 hover:bg-black/5 focus:bg-black/10 dark:hover:bg-white/10 dark:focus:bg-white/10':
        true,
      'bg-black/5 dark:bg-white/10': active,
    });

    return (
      <Tooltip content={coin.name} placement="left" delayMs={[1500, 0]}>
        <button ref={ref} className={styles} onClick={onClick}>
          <div className="flex w-full flex-row items-center">
            {leftIcon}
            <div className="flex flex-col items-start overflow-hidden">
              <Text size="md" className="w-full truncate text-left">
                {coin.name}
              </Text>
              <Text color="secondary" size="sm">
                {coin.id}
              </Text>
            </div>
          </div>
          {rightIcon}
        </button>
      </Tooltip>
    );
  }
);

const POPULAR_COINS = ['BTC', 'ETH', 'SOL', 'USDC', 'DOGE', 'LTC'];

type CoinSelectorProps = {
  selectedCoinId?: string;
  onChange?: (coinId: string) => void;
  filter?: (coin: Coin) => boolean;
  className?: string;
};

export const CoinSelector = forwardRef<HTMLDivElement, CoinSelectorProps>(
  (props, ref) => {
    const { selectedCoinId, className = '', onChange, filter } = props;
    const {
      coins,
      coinsMap,
      isLoading: coinsLoading,
    } = useCoins({
      refetchOnWindowFocus: false,
    });

    const isLoading = coinsLoading;

    const [searchQuery, setSearchQuery] = useState('');

    const filteredCoins: Coin[] = useMemo(() => {
      if (filter) {
        return coins?.filter(filter) ?? [];
      } else {
        return coins ?? [];
      }
    }, [coins, filter]);

    /*
    const popularCoins: Coin[] = useMemo(() => {
      if (coinsMap) {
        const popularCoins = POPULAR_COINS.map((c) => coinsMap[c]);
        if (filter) {
          const popularCoinsFiltered = popularCoins.filter(filter);
          if (popularCoinsFiltered.length != popularCoins.length) {
            return filteredCoins.slice(0, 6);
          } else {
            return popularCoinsFiltered;
          }
        } else {
          return popularCoins;
        }
      } else {
        return [];
      }
    }, [coinsMap, filteredCoins, filter]);
*/

    const searchResults: Coin[] = useMemo(() => {
      if (searchQuery.length === 0) {
        return filteredCoins; // change to popularCoins if needed
      } else if (filteredCoins) {
        const searchQueryLowercase = searchQuery.toLowerCase();
        return filteredCoins.filter((c) => {
          const coinId = c.id.toLowerCase();
          const coinName = c.name.toLowerCase();
          return (
            coinId.includes(searchQueryLowercase) ||
            coinName.includes(searchQueryLowercase)
          );
        });
      } else {
        return [];
      }
    }, [filteredCoins, searchQuery]);

    const { focused: inputFocused, ref: inputRef } = useFocusWithin();
    useEffect(() => {
      const timer = setTimeout(() => {
        inputRef.current?.select();
      }, 0);
      return () => {
        clearTimeout(timer);
      };
    }, [inputFocused, inputRef]);

    return (
      <Combobox
        value={selectedCoinId}
        onChange={(val) => {
          if (val) {
            onChange?.(val);
          }
        }}
      >
        <div className={clsx('flex flex-col', className)}>
          <div className="px-3 text-md">
            <Combobox.Input
              ref={inputRef}
              type="text"
              className={clsx({
                'w-full': true,
                'rounded-lg border text-md text-grayLight-70 outline-none transition dark:text-white':
                  true,
                'py-3 px-4': true,
                'text-black focus:border-brand-500': true,
                'dark:border-grayDark-40 dark:bg-grayDark-40 dark:text-grayDark-120 dark:placeholder:text-grayDark-80 dark:focus:border-brand-500':
                  true,
                [`${className}`]: true,
              })}
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            ></Combobox.Input>
          </div>
          <div className="mt-1 px-4">
            {isLoading && (
              <div className="mt-1 flex w-full flex-col">
                <LoaderIconDoubleLine className="my-2" />
                <LoaderIconDoubleLine className="my-2" />
                <LoaderIconDoubleLine className="my-2" />
                <LoaderIconDoubleLine className="my-2" />
                <LoaderIconDoubleLine className="my-2" />
                <LoaderIconDoubleLine className="my-2" />
              </div>
            )}
            {searchQuery.length > 0 && (
              <Text size="sm">{searchResults.length} results found</Text>
            )}
          </div>
          <div className="h-2"></div>
          <Combobox.Options
            className="max-h-[400px] flex-1 overflow-y-auto"
            static
          >
            {!isLoading &&
              searchResults.map((res, idx) => (
                <Combobox.Option key={res.id} value={res.id}>
                  {({ selected, active }) => (
                    <CoinSelectorItem
                      selected={selected}
                      active={active}
                      key={res.id}
                      coin={res}
                      leftIcon={
                        <CryptoIcon coinId={res.id} className="mr-4 h-6 w-6" />
                      }
                      rightIcon={
                        <div className="flex w-24 items-center justify-end">
                          <FontAwesomeIcon
                            className="w-2 text-grayLight-70 dark:text-grayDark-80"
                            icon={faAngleRight}
                          />
                        </div>
                      }
                      onClick={() => { }}
                    />
                  )}
                </Combobox.Option>
              ))}
          </Combobox.Options>
        </div>
      </Combobox>
    );
  }
);

CoinSelector.displayName = 'CoinSelector';
