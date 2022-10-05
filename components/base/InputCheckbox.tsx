import React from 'react';

import clsx from 'clsx';

import { Text } from './Text';

type Props = {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const InputCheckbox = React.forwardRef<HTMLInputElement, Props>(
  ({ className, label, ...rest }, ref) => {
    return (
      <label className="flex-column flex-column my-4 flex text-sm text-black dark:text-white">
        <input
          type="checkbox"
          ref={ref}
          className={clsx(
            'focus:border-primary-500 focus:ring-primary-500 block rounded-lg border border-grayLight-40 bg-grayLight-10 p-2.5 text-sm',
            className
          )}
          {...rest}
        />
        <Text className="pl-2">{label}</Text>
      </label>
    );
  }
);
InputCheckbox.displayName = 'InputCheckbox';
