import React, { TextareaHTMLAttributes } from 'react';

import clsx from 'clsx';

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, ...rest }, ref) => {
    const textAreaPrimaryStyle = clsx({
      'w-full py-3 px-4 rounded-md ': true,
      [`${className}`]: true,
    });

    return <textarea {...rest} className={textAreaPrimaryStyle} ref={ref} />;
  }
);
TextArea.displayName = 'TextArea';
