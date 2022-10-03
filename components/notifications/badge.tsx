import React from 'react';

import clsx from 'clsx';

export type BadgeProps = {
  number?: number;
} & React.HTMLAttributes<HTMLDivElement>;

export const Badge = ({ className, number }: BadgeProps) => {
  const primaryStyle = clsx({
    'bg-brand-500 flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full text-grayLight-20':
      true,
    'text-sm': true,
    [`${className}`]: true,
  });
  if (!number || number === 0) {
    return <> </>;
  }
  return (
    <div className={primaryStyle}>
      <span>{number}</span>
    </div>
  );
};
