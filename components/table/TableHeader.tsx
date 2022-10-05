import React from 'react';

import clsx from 'clsx';

export function TableHeader(props: React.HTMLAttributes<HTMLElement>) {
  const { className, ...rest } = props;
  return (
    <thead
      className={clsx(
        `text-xs uppercase text-grayLight-80 
        dark:text-grayDark-100`,
        className
      )}
      {...rest}
    />
  );
}
