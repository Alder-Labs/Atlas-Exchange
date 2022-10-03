import { HTMLAttributes } from 'react';

import clsx from 'clsx';
import Skeleton from 'react-loading-skeleton';

interface LoaderIconSingleLineProps extends HTMLAttributes<HTMLDivElement> {}

export function LoaderIconSingleLine(props: LoaderIconSingleLineProps) {
  const { className, ...rest } = props;
  return (
    <div {...rest} className={clsx(className)}>
      <div className="flex flex-row">
        <Skeleton circle={true} width={42} height={42} style={{ zIndex: 0 }} />
        <div className="ml-2">
          <Skeleton width={64} style={{ zIndex: 0 }} />
        </div>
      </div>
    </div>
  );
}
