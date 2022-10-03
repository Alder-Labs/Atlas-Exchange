import React from 'react';

import clsx from 'clsx';

type TextInputProps = {
  label?: string;
  renderPrefix?: () => JSX.Element;
  renderSuffix?: () => JSX.Element;
  inputSize?: 'sm' | 'md' | 'lg';
} & React.InputHTMLAttributes<HTMLInputElement>;

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    { className, label, renderPrefix, renderSuffix, inputSize = 'md', ...rest },
    ref
  ) => {
    const containerStyles = clsx({
      'relative dark:text-white text-md rounded-lg border text-grayLight-70 outline-none transition flex items-center':
        true,
      'focus-within:border-brand-300 dark:focus-within:border-brand-500': true,
      'border-grayLight-40 dark:border-grayDark-40 ': true,
      'text-black dark:bg-grayDark-40 dark:text-grayDark-120 dark:placeholder:text-grayDark-80':
        true,
    });

    const inputStyles = clsx({
      'w-full outline-none dark:bg-grayDark-40 rounded-lg bg-white': true,
      'py-3': inputSize === 'md',
      'pl-4': inputSize === 'md' && !renderPrefix,
      'pr-4': inputSize === 'md' && !renderSuffix,
      'py-1 text-sm': inputSize === 'sm',
      'pl-1.5': inputSize === 'sm' && !renderPrefix,
      'pr-1.5': inputSize === 'sm' && !renderSuffix,
    });

    const prefix = renderPrefix?.();
    const suffix = renderSuffix?.();

    return (
      <div
        className={className}
        onClick={() => {
          if (typeof ref !== 'function') {
            if (ref?.current) {
              ref.current.focus();
            }
          }
        }}
      >
        {label && (
          <>
            <label className="dark:text-grayDark-80 block text-sm font-medium text-black">
              {label}
            </label>
            <div className="h-2" />
          </>
        )}
        <div className={containerStyles}>
          {prefix}

          <input {...rest} ref={ref} className={inputStyles} />
          {suffix}
        </div>
      </div>
    );
  }
);
TextInput.displayName = 'TextInput';
