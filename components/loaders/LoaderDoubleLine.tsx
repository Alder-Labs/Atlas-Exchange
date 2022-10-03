import { HTMLAttributes } from 'react';

import 'react-loading-skeleton/dist/skeleton.css';

import Skeleton from 'react-loading-skeleton';
import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '../../tailwind.config';

import { LoaderTheme } from './LoaderTheme';

const fullConfig = resolveConfig(tailwindConfig);

// @ts-ignore
const height = fullConfig.theme?.height['4'];

interface LoaderDoubleLineProps extends HTMLAttributes<HTMLDivElement> {}

export function LoaderDoubleLine(props: LoaderDoubleLineProps) {
  const { className, ...rest } = props;

  return (
    <div {...rest} className={className}>
      <Skeleton height={height} width="75%" style={{ zIndex: 0 }} />
      <Skeleton height={height} width="25%" style={{ zIndex: 0 }} />
    </div>
  );
}
