import { HTMLAttributes } from 'react';

import classNames from 'classnames';

type ResponsiveProps = HTMLAttributes<HTMLDivElement> & {
  showIfLargerThan?: 'sm' | 'md' | 'lg' | 'xl';
  showIfSmallerThan?: 'sm' | 'md' | 'lg' | 'xl';
};

// Prevent pruning
('sm:hidden md:hidden lg:hidden xl:hidden');
('sm:block md:block lg:block xl:block');

export function Responsive(props: ResponsiveProps) {
  const { className, showIfLargerThan, showIfSmallerThan, ...rest } = props;

  const styles = classNames({
    [`hidden ${showIfLargerThan}:block`]: !!showIfLargerThan,
    [`block ${showIfSmallerThan}:hidden`]: !!showIfSmallerThan,
    [`${className}`]: true,
  });
  return <div {...rest} className={styles} />;
}
