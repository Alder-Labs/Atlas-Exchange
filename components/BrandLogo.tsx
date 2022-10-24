import Link from 'next/link';

import { useDarkOrLightMode } from '../lib/dark-mode';

export const BrandLogo = (props: {
  className: string;
  href?: string;
<<<<<<< HEAD
  noIcon?: boolean;
}) => {
  const { className, href = '/', noIcon = false } = props;
=======
  noLogo?: boolean;
}) => {
  const { className, href = '/', noLogo = false } = props;
>>>>>>> 608ce13 (stylize footer)
  const darkMode = useDarkOrLightMode();

  return (
    <Link href={href}>
      <div className="flex items-center">
<<<<<<< HEAD
        {!noIcon && (
=======
        {!noLogo && (
>>>>>>> 608ce13 (stylize footer)
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
