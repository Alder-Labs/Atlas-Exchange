import React, { useEffect, useState } from 'react';

import clsx from 'clsx';

type Props = {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const InputWithInlineLabel = React.forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, onBlur, onSelect, className, label, ...rest }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [labelShiftedUp, setLabelShiftedUp] = useState(false);
    const [userInput, setUserInput] = useState('');

    useEffect(() => {
      if (value) {
        setLabelShiftedUp(true);
      } else {
        setLabelShiftedUp(false);
      }
    }, [value]);

    const handleSelect = () => {
      if (isFocused) return;
      setLabelShiftedUp(true);
      setIsFocused(true);
    };

    const handleDeselect = () => {
      setIsFocused(false);
      if (userInput === '' && !value) {
        setLabelShiftedUp(false);
      }
    };

    const onInputChange = (val: string) => {
      setLabelShiftedUp(true);
      setUserInput(val);
    };

    return (
      <div
        className={clsx(
          `relative my-4 flex items-center 
          ${isFocused && 'border-primary-500 ring-primary-500'}`,
          className
        )}
      >
        <div className={'h-1/4'}></div>
        <span
          className={`pointer-events-none absolute left-4 select-none 
            transition-all duration-100 ease-in-out 
            ${labelShiftedUp ? 'top-3 text-xs' : 'text-md'} 
            ${isFocused ? 'text-primary-500' : 'text-grayLight-60'}`}
        >
          {label}
        </span>
        <input
          type={'text'}
          className={`h-3/4 w-full rounded-lg border bg-grayLight-10 px-4 
            pt-8 pb-5 text-sm ${
              isFocused ? '' : 'caret-primary-50 outline-none'
            }`}
          onSelect={handleSelect}
          onBlur={handleDeselect}
          onChange={(e) => onInputChange(e.target.value)}
          value={value}
          {...rest}
          ref={ref}
        />
      </div>
    );
  }
);
InputWithInlineLabel.displayName = 'InputWithInlineLabel';
