import { ReactNode } from 'react';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';

import { Title } from './base';

interface TitledCardProps {
  children?: ReactNode;
  title: string;
  onGoBack?: () => void;
  className?: string;
}

export function TitledCard(props: TitledCardProps) {
  const { children, title, onGoBack, className } = props;

  const cardStyles = clsx({
    'animate-enter box-border w-full rounded-2xl bg-white text-white shadow-md dark:bg-grayDark-20':
      true,
    [`${className}`]: true,
  });
  return (
    <div className={cardStyles}>
      <div className="flex items-center justify-center gap-2 border-b border-grayLight-40 p-4 py-6 dark:border-grayDark-40">
        <div className="mx-4 flex flex-1 justify-start">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="flex h-4 w-4 items-center text-grayLight-50 transition hover:text-grayLight-80 dark:hover:text-white"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
          )}
        </div>
        <Title order={4}>{title}</Title>
        <div className="mx-4 flex flex-1 justify-end"></div>
      </div>
      {children}
    </div>
  );
}
