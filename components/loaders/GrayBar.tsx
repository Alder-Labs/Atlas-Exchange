import React, { HTMLAttributes } from 'react';

import clsx from 'clsx';

type GrayBarProps = {
  rounded?: 'full' | 'md' | 'none';
  background?: string;
} & HTMLAttributes<HTMLDivElement>;

export const GrayBar = ({
  className,
  rounded = 'full',
  background = 'bg-grayLight-30 dark:bg-grayDark-60',
  ...rest
}: GrayBarProps) => {
  return (
    <div
      {...rest}
      className={clsx({
        'w-full animate-pulse': true,
        'rounded-full': rounded === 'full',
        'rounded-md': rounded === 'md',
        [background]: true,
        [`${className}`]: true,
      })}
    />
  );
};
