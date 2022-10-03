import React from 'react';

import clsx from 'clsx';

export function TableCell(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  const { className, ...rest } = props;

  return <td className={clsx('', className)} {...rest} />;
}
