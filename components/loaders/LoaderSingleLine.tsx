import { HTMLAttributes } from 'react';

import Skeleton from 'react-loading-skeleton';

interface LoaderSingleLineProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
}

export function LoaderSingleLine(props: LoaderSingleLineProps) {
  const { className, height, width, ...rest } = props;

  return (
    <div {...rest} className={className}>
      <Skeleton height={height} width={width} style={{ zIndex: 0 }} />
    </div>
  );
}
