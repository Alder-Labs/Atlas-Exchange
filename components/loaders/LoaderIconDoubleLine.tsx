import { HTMLAttributes } from 'react';

import clsx from 'clsx';
import Skeleton from 'react-loading-skeleton';
import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);

// @ts-ignore
const height = fullConfig.theme?.height['4'];

interface LoaderIconDoubleLineProps extends HTMLAttributes<HTMLDivElement> {}

export function LoaderIconDoubleLine(props: LoaderIconDoubleLineProps) {
  const { className, ...rest } = props;
  return (
    <div {...rest} className={clsx(className)}>
      <div className="flex flex-row">
        <Skeleton circle={true} width={38} height={38} style={{ zIndex: 0 }} />
        <div className="ml-2">
          <Skeleton width={64} height={height} style={{ zIndex: 0 }} />
          <Skeleton width={24} height={height} style={{ zIndex: 0 }} />
        </div>
      </div>
    </div>
  );
}
