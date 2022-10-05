import React from 'react';

import clsx from 'clsx';

export function TableHeaderCell(props: React.ThHTMLAttributes<HTMLElement>) {
  const { className, scope = 'col', colSpan, ...rest } = props;
  return (
    <th
      className={clsx('bg-grayLight-10 py-3 dark:bg-grayDark-20', className)}
      scope={scope}
      colSpan={colSpan}
      {...rest}
    />
  );
}
