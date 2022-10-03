import React, { forwardRef } from 'react';

import clsx from 'clsx';

import { LoaderSingleLine } from '../loaders';

export type TitleOrder = 1 | 2 | 3 | 4 | 5 | 6;

type TitleOrderProperties = {
  styles: string;
  htmlTag: keyof JSX.IntrinsicElements;
};
const TITLE_ORDER_PROPERTIES: Record<TitleOrder, TitleOrderProperties> = {
  1: { styles: 'text-4xl', htmlTag: 'h1' },
  2: { styles: 'text-3xl', htmlTag: 'h2' },
  3: { styles: 'text-2xl', htmlTag: 'h3' },
  4: { styles: 'text-xl', htmlTag: 'h4' },
  5: { styles: 'text-lg', htmlTag: 'h5' },
  6: { styles: 'text-md', htmlTag: 'h6' },
};

interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  order?: TitleOrder;
  isLoading?: boolean;
  loadingWidth?: string | number;
}

export const Title = forwardRef<HTMLHeadingElement, TitleProps>(
  ({ order = 3, className, children, isLoading, loadingWidth = 'md' }, ref) => {
    const { styles, htmlTag: Heading } = TITLE_ORDER_PROPERTIES[order];

    const loadingPlaceholderStyles = clsx({
      'absolute h-full w-full inset-0': true,
      invisible: !isLoading,
      visible: isLoading,
    });

    return (
      <Heading
        className={clsx(
          `dark:text-grayDark-120 text-grayLight-100 relative font-light`,
          styles,
          className
        )}
        style={{ width: isLoading ? loadingWidth : undefined }}
      >
        {isLoading ? '‎' : children}
        <div className={loadingPlaceholderStyles}>
          <LoaderSingleLine width={loadingWidth} height={'100%'} />
        </div>
      </Heading>
    );
  }
);
Title.displayName = 'Title';
