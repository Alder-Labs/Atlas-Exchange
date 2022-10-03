import React, { useCallback, useState } from 'react';

import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { getDarkModeSetting, setDarkMode } from '../lib/dark-mode';

import { Text } from './base';
import { TitledModal, TitledModalProps } from './modals/TitledModal';

interface MenuItemProps {
  title: string;
  description?: string;
  onClick: () => void;
  selected?: boolean;
}

const MenuItem = (props: MenuItemProps) => {
  const { title, description, onClick, selected } = props;

  return (
    <div className="max-w-full basis-full">
      <button
        className="dark:hover:bg-grayDark-40 hover:bg-grayLight-30 w-full py-4 px-4 duration-300"
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start justify-start">
            <Text size="lg">{title}</Text>
            {description && (
              <>
                <div className="h-1"></div>
                <Text size="md" color="secondary" className="text-start">
                  {description}
                </Text>
              </>
            )}
          </div>
          <Text>
            {selected ? (
              <FontAwesomeIcon
                icon={faCheck}
                className="ml-4 h-5 w-5 shrink-0"
                color="brand"
              />
            ) : (
              <div className="ml-4 h-5 w-5 shrink-0"></div>
            )}
          </Text>
        </div>
      </button>
    </div>
  );
};
interface DarkModeModalProps extends Omit<TitledModalProps, 'title'> {}
export function DarkModeModal({ isOpen, ...rest }: DarkModeModalProps) {
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);

  return (
    <>
      <TitledModal {...rest} isOpen={isOpen} title={'Appearance'}>
        <div className="py-4">
          <MenuItem
            title={`System Default`}
            selected={getDarkModeSetting() === 'auto'}
            description="Use your device’s default mode base on your timezone"
            onClick={() => {
              setDarkMode('auto');
              forceUpdate();
            }}
          />
          <MenuItem
            title={`Light Mode`}
            selected={getDarkModeSetting() === 'light'}
            description="Always use Light Mode"
            onClick={() => {
              setDarkMode('light');
              forceUpdate();
            }}
          />
          <MenuItem
            title={`Dark Mode`}
            selected={getDarkModeSetting() === 'dark'}
            description="Always use Dark Mode"
            onClick={() => {
              setDarkMode('dark');
              forceUpdate();
            }}
          />
        </div>
      </TitledModal>
    </>

    // <Button
    //   variant="outline"
    //   size="sm"
    //   onClick={() => {
    //     setDarkMode(getDarkOrLightMode() === 'light' ? 'dark' : 'light');
    //     forceUpdate();
    //   }}
    //   className={clsx('', className)}
    // >
    //   {getDarkOrLightMode() === 'light' ? (
    //     <FontAwesomeIcon icon={faSun} className="h-4 w-4" size={'sm'} />
    //   ) : (
    //     <FontAwesomeIcon icon={faMoon} className="h-4 w-4" size={'sm'} />
    //   )}
    // </Button>
  );
}
