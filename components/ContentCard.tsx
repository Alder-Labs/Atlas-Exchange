import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';

import { Button, Title } from './base';

export interface ContentCardProps {
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
  padding?: boolean;
  className?: string;
  center?: boolean;
}
export function ContentCard(props: ContentCardProps) {
  let {
    title,
    onBack,
    children,
    padding = true,
    className,
    center = true,
  } = props;

  const styles = clsx({
    'mx-auto max-w-md w-full translate mt-16 sm:mt-40': center,
    'rounded-xl pt-10 bg-grayLight-20 dark:bg-grayDark-20': true,
    [`${className}`]: true,
  });

  const childStyles = clsx({
    'px-6 pb-8': padding,
  });
  return (
    <div className={styles}>
      <div className="flex items-center px-6">
        {onBack && (
          <button
            onClick={onBack}
            className="hover:text-grayLight-80 text-grayLight-50 mr-4 flex h-4 w-4 items-center overflow-hidden transition dark:hover:text-white"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        )}
        <Title className="font-bold">{title}</Title>
      </div>

      <div className={childStyles}>{children}</div>
    </div>
  );
}
