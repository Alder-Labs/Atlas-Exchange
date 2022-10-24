import Link from 'next/link';

import { useDarkOrLightMode } from '../lib/dark-mode';

export const BrandLogo = (props: {
  className: string;
  href?: string;
  noIcon?: boolean;
}) => {
  const { className, href = '/', noIcon = false } = props;
  const darkMode = useDarkOrLightMode();

  return (
    <Link href={href}>
      <div className="flex items-center">
        {!noIcon && (
          <img
            src="/brave-lion-logo-rgb.svg"
            className="mr-2.5 h-9 w-6"
            alt="Logo"
          />
        )}
        {/* <img src="/favicon.ico" className="mr-3 h-6 sm:h-9" alt="Logo" /> */}
        <img
          src={
            darkMode === 'dark'
              ? '/brave-text-logo-white.svg'
              : '/brave-text-logo-gray.svg'
          }
          className={className}
          alt="Logo"
        />
      </div>
    </Link>
  );
};
