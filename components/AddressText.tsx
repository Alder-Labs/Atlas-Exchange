import React from 'react';

import clsx from 'clsx';

import { Text } from './base';

export interface Props extends React.HTMLAttributes<HTMLDivElement> {}

export const AddressText = React.forwardRef<HTMLDivElement, Props>(
  ({ className, children, ...rest }, ref) => {
    return (
      <span
        className={clsx(
          'dark:bg-grayDark-50 bg-grayLight-30 block break-all rounded-md px-1.5 py-1 text-left text-black dark:text-white',
          className
        )}
        {...rest}
      >
        <Text className="font-mono">{children}</Text>
      </span>
    );
  }
);

AddressText.displayName = 'AddressText';
