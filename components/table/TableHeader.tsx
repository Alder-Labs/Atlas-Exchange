import React from 'react';

import clsx from 'clsx';

export function TableHeader(props: React.HTMLAttributes<HTMLElement>) {
  const { className, ...rest } = props;
  return (
    <thead
      className={clsx(
        `dark:text-grayDark-100 text-grayLight-80 text-xs 
        uppercase`,
        className
      )}
      {...rest}
    />
  );
}
