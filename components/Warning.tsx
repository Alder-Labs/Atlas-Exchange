import clsx from 'clsx';
import React from 'react';

export function TextBubble(props: {
  className?: string;
  children: React.ReactNode;
}) {
  const { className, children } = props;
  return <div className={clsx('rounded-lg p-4', className)}>{children}</div>;
}

export function Warning(props: { children: React.ReactNode }) {
  return (
    <TextBubble className="bg-warningDark/25 dark:bg-warningDark/25">
      {props.children}
    </TextBubble>
  );
}
