import { ReactNode } from 'react';

import classNames from 'classnames';

export interface SidePaddingProps {
  children?: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function SidePadding({
  children,
  className,
  as = 'div',
}: SidePaddingProps) {
  const styles = classNames({
    'w-full px-4 lg:px-6 flex flex-col items-center': true,
    [`${className}`]: true,
  });

  const HtmlTag = as;
  return (
    <HtmlTag className={styles}>
      <div className="flex w-full max-w-6xl flex-1 flex-col">{children}</div>
    </HtmlTag>
  );
}
