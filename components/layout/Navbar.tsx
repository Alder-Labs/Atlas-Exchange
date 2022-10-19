import React, { ReactNode, useState } from 'react';

import {
  faXmark,
  faBell,
  faHomeLg,
  faNavicon,
  faUser,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useLoginStatus } from '../../hooks/useLoginStatus';
import { useModalState } from '../../hooks/useModalState';
import { useUserState } from '../../lib/auth-token-context';
import { useDarkOrLightMode } from '../../lib/dark-mode';
import { toast } from '../../lib/toast';
import { ModalState } from '../../lib/types/modalState';
import { Button, Text } from '../base';
import Drawer from '../Drawer';

import { Dropdown } from './Dropdown';
import { NotificationDropdown } from './NotificationDropdown';
import { Responsive } from './Responsive';
import { SidePadding } from './SidePadding';

export function IconButton(props: {
  icon: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  const { icon, onClick, className } = props;
  const primaryIconStyles = clsx({
    'flex h-8 w-8 items-center justify-center rounded-full p-2': true,
    'transition dark:bg-grayDark-50 dark:text-grayDark-120 dark:hover:bg-grayDark-60':
      true,
    [`${className}`]: true,
  });
  return (
    <button onClick={onClick} className={primaryIconStyles}>
      {icon}
    </button>
  );
}

interface NavbarLinkProps {
  href: string;
  icon: ReactNode;
  text: string;
  isActive?: boolean;
}

function NavbarLink(props: NavbarLinkProps) {
  const { href, icon, text, isActive } = props;

  const primaryStyle = clsx({
    'dark:hover:text-brand-500 text-md': true,
    'flex items-center gap-2 transition ': true,
    'dark:text-grayDark-70 text-grayLight-7 hover:text-brand-700': !isActive,
    'dark:text-brand-500 text-brand-500': isActive,
  });

  return (
    <Link href={href}>
      <a className={primaryStyle}>
        <span className="flex items-center">{icon}</span>
        <span>{text}</span>
      </a>
    </Link>
  );
}

interface MobileNavbarLinkProps {
  href: string;
  icon: ReactNode;
  text: string;
  isActive?: boolean;
  onClick?: () => void;
}

function MobileNavbarLink(props: MobileNavbarLinkProps) {
  const { href, icon, text, isActive, onClick } = props;

  const primaryStyle = clsx({
    'hover:text-brand-500 dark:text-grayDark-120 text-lg flex w-full px-4 py-3 rounded-md':
      true,
    'items-center gap-2 text-black transition ': true,
    'dark:bg-grayDark-50 pointer-events-none': isActive,
    'dark:hover:bg-grayDark-50': !isActive,
  });

  return (
    <Link href={href}>
      <a className={primaryStyle} onClick={onClick}>
        <span>{icon}</span>
        <span>{text}</span>
      </a>
    </Link>
  );
}

interface NavbarProps {
  children?: React.ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  const userState = useUserState();
  const signedIn = !!userState.user;

  const { data: loginStatusData, isLoading: loadingLoginStatusData } =
    useLoginStatus();

  const router = useRouter();
  const url = router.pathname;

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [modalStateDetailed, setModalStateDetailed] = useModalState();

  const basicMode =
    ['/onboarding/begin', '/onboarding', '/onboarding/signup'].includes(
      router.pathname
    ) ||
    [ModalState.SmsAuth, ModalState.TotpAuth].includes(
      modalStateDetailed.state
    );

  const [drawerOpen, setDrawerOpen] = useState(false);

  const darkMode = useDarkOrLightMode();

  return (
    <>
      <Responsive showIfSmallerThan="lg" className="sticky top-0 z-40 w-full">
        <div className="flex w-full items-center justify-between bg-grayLight-20 dark:bg-grayDark-20">
          <Link href="/">
            <a className="flex items-center pl-4">
              {/* <img src="/favicon.ico" className="mr-3 h-6 sm:h-9" alt="Logo" /> */}
              <img
                src={
                  darkMode === 'dark'
                    ? '/brave-text-logo-white.svg'
                    : '/brave-text-logo-gray.svg'
                }
                className="w-16"
                alt="Logo"
              />
            </a>
          </Link>
          <button
            className="flex items-center p-4"
            onClick={() => {
              setDrawerOpen(true);
            }}
          >
            <FontAwesomeIcon icon={faNavicon} className="h-6 w-6" />
          </button>
        </div>
        <Drawer
          widthClassName="w-64"
          closedClassName="-right-64"
          openClassName="right-0"
          isOpen={drawerOpen}
          onRequestClose={() => {
            setDrawerOpen(false);
          }}
        >
          <div className="h-full w-full dark:bg-grayDark-40">
            <div className="flex w-full items-center justify-end">
              <button
                className="flex items-center p-4"
                onClick={() => {
                  setDrawerOpen(false);
                }}
              >
                <FontAwesomeIcon icon={faXmark} className="h-6 w-6" />
              </button>
            </div>
            <div className="mx-6 mb-6 flex w-full items-center">
              <Text isLoading={loadingLoginStatusData} loadingWidth="8rem">
                {loginStatusData?.loggedIn
                  ? loginStatusData.user.displayName
                  : 'Not logged in'}
              </Text>
            </div>
            <div className="flex flex-col gap-1 px-2">
              <MobileNavbarLink
                href="/"
                icon={<FontAwesomeIcon icon={faHomeLg} className="h-4 w-4" />}
                text="Home"
                isActive={url === '/'}
                onClick={() => {
                  setDrawerOpen(false);
                }}
              />

              <MobileNavbarLink
                href="/wallet"
                icon={<FontAwesomeIcon icon={faWallet} className="h-4 w-4" />}
                text="Wallet"
                isActive={url === '/wallet'}
                onClick={() => {
                  setDrawerOpen(false);
                }}
              />

              <MobileNavbarLink
                href="/notifications"
                icon={<FontAwesomeIcon icon={faBell} className="h-4 w-4" />}
                text="Notifications"
                isActive={url === '/notifications'}
                onClick={() => {
                  setDrawerOpen(false);
                }}
              />

              <MobileNavbarLink
                href="/account"
                icon={<FontAwesomeIcon icon={faUser} className="h-4 w-4" />}
                text="Settings"
                isActive={url === '/account'}
                onClick={() => {
                  setDrawerOpen(false);
                }}
              />

              <Button
                rounded="md"
                className="mx-4 mt-4"
                onClick={() => {
                  setDrawerOpen(false);
                  setModalStateDetailed({ state: ModalState.DepositFiat });
                }}
              >
                Deposit funds
              </Button>

              <Button
                rounded="md"
                className="mx-4 mt-4"
                onClick={() => {
                  setDrawerOpen(false);
                  setModalStateDetailed({
                    state: ModalState.SendReceiveCrypto,
                  });
                }}
              >
                Send / Receive
              </Button>
              {userState.user ? (
                <Button
                  variant="outline"
                  rounded="md"
                  className="mx-4 mt-16"
                  onClick={() => {
                    setDrawerOpen(false);
                    setIsSigningOut(true);
                    userState
                      .signout()
                      .catch((err: Error) => {
                        toast.error(`Error: ${err.message}`);
                      })
                      .finally(() => {
                        router.push('/').then(() => {
                          setIsSigningOut(false);
                        });
                      });
                    setModalStateDetailed({ state: ModalState.SignIn });
                  }}
                >
                  Sign out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  rounded="md"
                  className="mx-4 mt-16"
                  onClick={() => {
                    setDrawerOpen(false);
                    setModalStateDetailed({ state: ModalState.SignIn });
                  }}
                >
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </Drawer>
      </Responsive>
      <Responsive showIfLargerThan="lg" className="z-40 w-full">
        <div className="sticky top-0 w-full border-b-2 border-grayLight-20 bg-white dark:border-grayDark-10 dark:bg-grayDark-10">
          <SidePadding as="nav" className="w-full py-4">
            <div className="flex w-full flex-wrap items-center justify-between px-8">
              <div className="flex flex-wrap items-center">
                <Link href="/">
                  <a className="mb-[2px] flex items-center">
                    <img
                      src="/brave-lion-logo-rgb.svg"
                      className="mr-2.5 h-4 w-6 sm:h-9"
                      alt="Logo"
                    />
                    <img
                      src={
                        darkMode === 'dark'
                          ? '/brave-text-logo-white.svg'
                          : '/brave-text-logo-gray.svg'
                      }
                      className="w-16"
                      alt="Logo"
                    />
                  </a>
                </Link>
                {signedIn && !basicMode && (
                  <>
                    <div className="w-10"></div>

                    <div className="flex items-center gap-6">
                      <NavbarLink
                        href="/"
                        icon={
                          <FontAwesomeIcon
                            icon={faHomeLg}
                            className="h-4 w-4"
                          />
                        }
                        text="Home"
                        isActive={url === '/'}
                      />

                      <NavbarLink
                        href="/wallet"
                        icon={
                          <FontAwesomeIcon
                            icon={faWallet}
                            className="h-4 w-4"
                          />
                        }
                        text="Wallet"
                        isActive={url === '/wallet'}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {signedIn && !basicMode && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setModalStateDetailed({
                          state: ModalState.DepositFiat,
                        });
                      }}
                    >
                      Deposit Funds
                    </Button>
                    <Button
                      variant="outline-gray"
                      size="sm"
                      onClick={() => {
                        setModalStateDetailed({
                          state: ModalState.SendReceiveCrypto,
                        });
                      }}
                    >
                      Send / Receive
                    </Button>
                    <NotificationDropdown />
                    <div className="w-0.5 self-stretch dark:bg-grayDark-50"></div>
                  </>
                )}
                {signedIn && <Dropdown />}
                {!signedIn && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setModalStateDetailed({ state: ModalState.SignIn })
                    }
                  >
                    Sign in
                  </Button>
                )}
              </div>
            </div>
          </SidePadding>
        </div>
      </Responsive>
    </>
  );
}
