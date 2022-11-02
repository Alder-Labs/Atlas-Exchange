import Link from 'next/link';

import { useDarkOrLightMode } from '../lib/dark-mode';

export const BrandLogo = (props: {
  className: string;
  href?: string;
  noIcon?: boolean;
  linkDisabled?: boolean;
}) => {
  const { className, href = '/', noIcon = false, linkDisabled = false } = props;
  const darkMode = useDarkOrLightMode();

  const Logo = () => {
    return (
      <div className="flex items-center">
        {!noIcon && (
          <img
            src="/atlas-lion-logo-rgb.svg"
            className="mr-2.5 h-9 w-6"
            alt="Logo"
          />
        )}
        {/* <img src="/favicon.ico" className="mr-3 h-6 sm:h-9" alt="Logo" /> */}
        <img
          src={
            darkMode === 'dark'
              ? '/atlas-text-logo-white.svg'
              : '/atlas-text-logo-gray.svg'
          }
          className={className}
          alt="Logo"
        />
      </div>
    );
  };

  return linkDisabled ? (
    <Logo />
  ) : (
    <Link href={href}>
      <Logo />
    </Link>
  );
};
