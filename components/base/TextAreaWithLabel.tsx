import React, { cloneElement, TextareaHTMLAttributes } from 'react';

import clsx from 'clsx';

import { useElementSize } from '../../hooks/utils';

import { TextLabel } from './TextLabel';

type Props = {
  label?: string;
  renderPrefix?: () => JSX.Element;
  textAreaClassName?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextAreaWithLabel = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ className, label, renderPrefix, textAreaClassName, ...rest }, ref) => {
    const { ref: prefixRef } = useElementSize();

    const textAreaPrimaryStyle = clsx({
      'w-full p-2 transition rounded-md py-3 px-4 resize-none bg-grayLight-20 dark:bg-grayDark-40 outline-none':
        true,
      'focus-within:border-brand-300 dark:focus-within:border-brand-500 border':
        true,
      'border-grayLight-40 dark:border-grayDark-40': true,
      [`${textAreaClassName}`]: true,
    });

    const prefixContainerStyle = clsx({
      'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3':
        true,
    });

    function renderLabel() {
      return (
        <>
          <TextLabel>{label}</TextLabel>
          <div className={'h-2'} />
        </>
      );
    }

    return (
      <div className={className}>
        {label && renderLabel()}
        <div className="text-md">
          {renderPrefix && (
            <div className={prefixContainerStyle}>
              {cloneElement(renderPrefix(), { ref: prefixRef })}
            </div>
          )}
          <textarea {...rest} ref={ref} className={textAreaPrimaryStyle} />
        </div>
      </div>
    );
  }
);
TextAreaWithLabel.displayName = 'TextAreaWithLabel';
