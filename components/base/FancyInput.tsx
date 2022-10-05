import React, { forwardRef, useEffect } from 'react';

import clsx from 'clsx';

type Props = {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const FancyInput = forwardRef<HTMLInputElement, Props>(
  ({ label, onChange, onBlur, name, className }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [inputText, setInputText] = React.useState('');

    useEffect(() => {
      if (inputText !== '') {
        setIsFocused(true);
      }
    }, [inputText]);

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsFocused(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      setInputText(e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      onBlur?.(e);
      if (inputText === '') {
        setIsFocused(false);
      }
    };

    return (
      <div className={clsx('relative flex items-center rounded-lg', className)}>
        <span
          className={`pointer-events-none absolute left-4 select-none transition-all duration-100 ease-in-out ${
            isFocused
              ? 'text-primary-500 top-3 text-xs'
              : 'text-md text-grayLight-60'
          }`}
        >
          {label}
        </span>
        <input
          className={`w-full rounded-lg border bg-grayLight-10 bg-transparent px-4 pt-8 pb-5 text-sm text-grayLight-110 `}
          ref={ref}
          onChange={handleChange}
          onBlur={handleBlur}
          onSelect={handleSelect}
          name={name}
        ></input>
      </div>
    );
  }
);
FancyInput.displayName = 'FancyInput';
