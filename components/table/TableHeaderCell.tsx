import React from 'react';

import clsx from 'clsx';

export function TableHeaderCell(props: React.ThHTMLAttributes<HTMLElement>) {
  const { className, scope = 'col', colSpan, ...rest } = props;
  return (
    <th
      className={clsx('dark:bg-grayDark-20 bg-grayLight-10 py-3', className)}
      scope={scope}
      colSpan={colSpan}
      {...rest}
    />
  );
}
