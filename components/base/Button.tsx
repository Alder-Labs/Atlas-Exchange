import React, { ButtonHTMLAttributes } from 'react';

import clsx from 'clsx';

type ButtonSize = 'xs' | 'sm' | 'md';

function Spinner({
  className,
  size,
}: {
  className?: string;
  size: ButtonSize;
}) {
  return (
    <svg
      role="status"
      className={clsx({
        'mb-[1px] inline animate-spin fill-grayLight-40 text-grayLight-110':
          true,
        '-ml-0.5 mr-1 h-2 w-2': size === 'xs',
        '-ml-2 mr-2 h-3 w-3 ': size === 'md',
        '-ml-1.5 mr-1.5 h-3 w-3 ': size === 'sm',
        className,
      })}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  rounded?: 'full' | 'md';
  floating?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-gray' | 'cta';
  size?: ButtonSize;
};

export const Button = ({
  className,
  children,
  loading = false,
  disabled = false,
  floating = false,
  rounded = 'full',
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) => {
  const ctaStyles = clsx({
    // Base
    ['border border-transparent text-white']: true,
    ['bg-gradient-to-r from-[#E32D00] to-[#E5007B]']: true,
    ['hover:brightness-110']: !disabled && !loading, // on hover
    ['active:brightness-125']: !disabled && !loading, // on press

    // Light Mode
    ['hover:bg-primaryLight-80']: true,

    // Dark Mode
    ['dark:hover:bg-primaryDark-60']: true,
  });

  const primaryStyles = clsx({
    ['border border-transparent text-white']: true,
    ['bg-gradient-to-r from-[#E32D00] to-[#E5007B]']: true,
    ['hover:brightness-110 active:brightness-125']: !disabled && !loading,
  });

  const secondaryStyles = clsx({
    ['border text-grayLight-110 dark:text-white']: true,
    ['bg-grayLight-20 border-grayLight-20']: true,
    ['dark:bg-grayDark-50 dark:border-grayDark-50 dark:text-white']: true,
    ['hover:bg-grayLight-30 dark:hover:bg-grayDark-60 active:bg-grayLight-40']:
      !disabled && !loading,
  });

  const outlineStyles = clsx({
    ['border']: true,
    ['bg-white dark:bg-black border-brand-500 text-brand-500']: true,
    ['hover:bg-brand-50/10 active:bg-brand-50/20 dark:hover:bg-brand-50/10 dark:active:bg-brand-50/20']:
      !disabled && !loading,
  });

  const outlineGrayStyles = clsx({
    ['border']: true,
    ['bg-grayLight-20 dark:bg-black border-grayLight-20 text-grayLight-90 dark:text-grayDark-90']:
      true,
    ['hover:brightness-95 active:bg-grayLight-20 dark:hover:bg-grayDark-20 dark:active:bg-grayDark-40']:
      !disabled && !loading,
  });

  const styles = clsx({
    [ctaStyles]: variant === 'cta',
    [primaryStyles]: variant === 'primary',
    [secondaryStyles]: variant === 'secondary',
    [outlineStyles]: variant === 'outline',
    [outlineGrayStyles]: variant === 'outline-gray',
    ['transition flex items-center justify-center shrink-0 font-medium']: true,
    ['rounded-full']: rounded === 'full',
    ['rounded-md']: rounded === 'md',
    ['px-8 py-2 text-md']: size === 'md',
    ['px-4 py-1 text-md']: size === 'sm',
    ['px-2 py-0.5 text-xs']: size === 'xs',
    ['cursor-not-allowed opacity-50']: disabled,
    ['cursor-not-allowed opacity-60']: loading,
    ['drop-shadow-md active:drop-shadow-none']: floating,
    [`${className}`]: className,
  });

  return (
    <button className={styles} disabled={disabled || loading} {...props}>
      {loading && <Spinner size={size} />}
      {children}
    </button>
  );
};
