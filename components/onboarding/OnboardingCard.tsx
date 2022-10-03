import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';

import { Title } from '../base';

export interface OnboardingCardProps {
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
  padding?: boolean;
  className?: string;
  center?: boolean;
}
export function OnboardingCard(props: OnboardingCardProps) {
  let { title, onBack, children, padding = true, className } = props;

  const styles = clsx({
    'rounded-2xl pt-10 bg-white dark:bg-grayDark-20 sm:max-w-lg shadow-lg':
      true,
    [`${className}`]: true,
  });

  const childStyles = clsx({
    'px-6 pb-10': padding,
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
