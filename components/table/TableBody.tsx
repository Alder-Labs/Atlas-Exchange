import React from 'react';

import clsx from 'clsx';

export function TableBody(props: React.HTMLAttributes<HTMLElement>) {
  const { className, ...rest } = props;
  return <tbody className={clsx(``, className)} {...rest} />;
}
