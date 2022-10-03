import { HTMLAttributes } from 'react';

import 'react-loading-skeleton/dist/skeleton.css';

import { SkeletonTheme } from 'react-loading-skeleton';
import resolveConfig from 'tailwindcss/resolveConfig';

import { useDarkOrLightMode } from '../../lib/dark-mode';
import tailwindConfig from '../../tailwind.config';
const fullConfig = resolveConfig(tailwindConfig);

interface LoaderThemeProps extends HTMLAttributes<HTMLDivElement> {}

// @ts-ignore
const borderRadius = fullConfig.theme?.borderRadius['md'];

export function LoaderTheme(props: LoaderThemeProps) {
  const { children } = props;

  const mode = useDarkOrLightMode();

  const baseColor =
    mode === 'dark'
      ? // @ts-ignore
        fullConfig.theme?.colors?.grayDark['10']
      : // @ts-ignore
        fullConfig.theme?.colors?.grayLight['10'];

  // @ts-ignore
  const highlightColor =
    mode === 'dark'
      ? // @ts-ignore
        fullConfig.theme?.colors?.grayDark['20']
      : // @ts-ignore
        fullConfig.theme?.colors?.grayLight['20'];

  return (
    <SkeletonTheme
      baseColor={baseColor}
      highlightColor={highlightColor}
      borderRadius={borderRadius}
    >
      {children}
    </SkeletonTheme>
  );
}
