import React, { HTMLAttributes, useCallback, useState } from 'react';

import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';

import { getDarkOrLightMode, setDarkMode } from '../lib/dark-mode';

import { Button } from './base';

export function DarkModeButton({ className }: HTMLAttributes<HTMLDivElement>) {
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        setDarkMode(getDarkOrLightMode() === 'light' ? 'dark' : 'light');
        forceUpdate();
      }}
      className={clsx('', className)}
    >
      {getDarkOrLightMode() === 'light' ? (
        <FontAwesomeIcon icon={faSun} className="h-4 w-4" size={'sm'} />
      ) : (
        <FontAwesomeIcon icon={faMoon} className="h-4 w-4" size={'sm'} />
      )}
    </Button>
  );
}
