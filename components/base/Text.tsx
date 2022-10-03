import React from 'react';

import clsx from 'clsx';

import { LoaderSingleLine } from '../loaders';

type TextWeight =
  | 'thin'
  | 'extralight'
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black';

type TextColor =
  | 'nocolor'
  | 'normal'
  | 'error'
  | 'brand'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info'
  | 'green'
  | 'red';

const COLOR_CLASSNAMES: Record<TextColor, string> = {
  nocolor: '',
  normal: 'text-grayLight-100 dark:text-grayDark-120',
  secondary: 'text-grayDark-70 dark:text-grayDark-80',
  error: 'text-error dark:text-errorDark',
  brand: 'text-brand-500',
  success: 'text-success dark:text-successDark',
  warning: 'text-warning dark:text-warningDark',
  info: 'text-info dark:text-infoDark',
  green: 'text-greenLight dark:text-greenDark',
  red: 'text-redLight dark:text-redDark',
};

const HOVER_COLOR_CLASSNAMES: Record<TextColor, string> = {
  nocolor: '',
  normal: 'hover:text-black hover:dark:text-grayDark-120',
  secondary: 'hover:text-grayLight-60 hover:dark:text-grayDark-80',
  error: 'hover:text-error hover:dark:text-errorDark',
  brand: 'hover:text-brand-500',
  success: 'hover:text-success hover:dark:text-successDark',
  warning: 'hover:text-warning hover:dark:text-warningDark',
  info: 'hover:text-info hover:dark:text-infoDark',
  green: 'hover:text-greenLight hover:dark:text-greenDark',
  red: 'hover:text-redLight hover:dark:text-redDark',
};

type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface TextProps {
  className?: string;
  children?: React.ReactNode;
  size?: TextSize;
  color?: TextColor | null; // Set to null if you want to set the color via className
  hoverColor?: TextColor | null;
  weight?: TextWeight;
  isLoading?: boolean;
  loadingWidth?: number | string;
  loadingHeight?: number | string;
}
export function Text({
  className,
  children,
  color = 'normal',
  hoverColor,
  size = 'md',
  weight = 'normal',
  isLoading = false,
  loadingWidth = '1em',
}: TextProps) {
  const colorClassNames = color && COLOR_CLASSNAMES[color];
  const hoverColorClassNames = hoverColor && HOVER_COLOR_CLASSNAMES[hoverColor];

  const styles = clsx({
    'transition relative': true,
    [`${colorClassNames}`]: true,
    [`${hoverColorClassNames}`]: true,
    'text-4xl': size === '4xl',
    'text-3xl': size === '3xl',
    'text-2xl': size === '2xl',
    'text-xl': size === 'xl',
    'text-lg': size === 'lg',
    'text-md': size === 'md',
    'text-sm': size === 'sm',
    'text-xs': size === 'xs',
    [`font-${weight}`]: true,
    invisible: isLoading,
    [`${className}`]: true,
  });

  const loadingPlaceholderStyles = clsx({
    'absolute h-full w-full inset-0': true,
    invisible: !isLoading,
    visible: isLoading,
  });

  return (
    <span
      className={styles}
      style={{
        width: isLoading ? loadingWidth : undefined,
      }}
    >
      {isLoading ? '‎' : children}
      <div className={loadingPlaceholderStyles}>
        <LoaderSingleLine width={loadingWidth} height={'100%'} />
      </div>
    </span>
  );
}
