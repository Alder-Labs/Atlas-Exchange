import { useEffect, useState } from 'react';

import { Portal, Tab } from '@headlessui/react';
import clsx from 'clsx';
import { useAtom } from 'jotai';

import { Text, Title } from '../../components/base';
import { bscFocusedAtom, buyCoinIdAtom } from '../../lib/jotai';

import { BuySellConvertShell } from './BuySellConvertShell';
import { PREVIEW_CONTAINER_ID } from './previewPortal';

interface CustomTabProps {
  title: string;
}

function CustomTab(props: CustomTabProps) {
  const { title } = props;

  return (
    <Tab className="outline-none">
      {({ selected }) => (
        <div
          className={clsx({
            'flex w-20 justify-center': true,
            'translate-y-[2px] select-none border-b-4 py-1 px-3 text-lg font-bold':
              true,
            'border-textAccent text-textAccent': selected,
            'border-transparent text-grayLight-70': !selected,
          })}
        >
          {title}
        </div>
      )}
    </Tab>
  );
}

interface BuySellConvertProps {
  className?: string;
  fromCoinId?: string;
  toCoinId?: string;
}

export function BuySellConvert(props: BuySellConvertProps) {
  const { className, fromCoinId, toCoinId } = props;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [buyCoinId] = useAtom(buyCoinIdAtom);
  useEffect(() => {
    if (buyCoinId) {
      setSelectedIndex(0);
    }
  }, [buyCoinId]);

  const [focused, setFocused] = useAtom(bscFocusedAtom);
  // Add dark:backdrop-blur if you want (I don't think we should)
  const dimDivStyles = clsx({
    'fixed inset-0 bg-grayLight-100/10 dark:bg-black/70  transition z-10': true,
    'opacity-100': focused,
    'pointer-events-none opacity-0': !focused,
  });

  return (
    <>
      <Portal>
        <div
          className={dimDivStyles}
          onClick={() => {
            setFocused(false);
          }}
        ></div>
      </Portal>
      <div
        className={clsx(
          className,
          'relative z-20 flex w-full flex-col items-center'
        )}
      >
        <div className="absolute -inset-6 rounded-md bg-white dark:bg-black"></div>
        <div className="w-full">
          <Title order={4} className="font-bold">
            Trade
          </Title>
          <div className="h-2"></div>
        </div>
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex w-full justify-between gap-2">
            <CustomTab title="Buy" />
            <CustomTab title="Sell" />
            <CustomTab title="Convert" />
          </Tab.List>
          <Tab.Panels className="z-10 h-full w-full">
            <Tab.Panel className="h-full outline-none">
              <BuySellConvertShell type="buy" />
            </Tab.Panel>
            <Tab.Panel className="h-full outline-none">
              <BuySellConvertShell type="sell" />
            </Tab.Panel>
            <Tab.Panel className="h-full outline-none">
              <BuySellConvertShell type="convert" />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
        <div
          className="pointer-events-none absolute inset-0 z-30"
          id={PREVIEW_CONTAINER_ID}
        ></div>
      </div>
    </>
  );
}
