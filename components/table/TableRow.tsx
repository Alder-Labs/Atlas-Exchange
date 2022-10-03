import React from 'react';

import clsx from 'clsx';

export function TableRow(props: React.HTMLAttributes<HTMLTableRowElement>) {
  const { className, ...rest } = props;
  return <tr className={clsx('', className)} {...rest} />;
}
