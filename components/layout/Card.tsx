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
        'bg-grayLight-110 m-auto flex max-w-lg flex-col rounded-2xl p-8',
        className
      )}
    >
      {children}
    </div>
  );
}
