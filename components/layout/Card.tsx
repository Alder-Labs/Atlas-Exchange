import React from 'react';

import clsx from 'clsx';

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export function Card({ children, className }: Props) {
  return (
    <div
      className={clsx(
        'm-auto flex max-w-lg flex-col rounded-2xl bg-grayLight-110 p-8',
        className
      )}
    >
      {children}
    </div>
  );
}
