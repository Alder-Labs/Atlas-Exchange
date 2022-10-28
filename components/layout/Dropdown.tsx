import { Fragment, useState } from 'react';

import { faChevronDown, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { useRouter } from 'next/router';

import { useLoginStatus } from '../../hooks/useLoginStatus';
import { useModal } from '../../hooks/useModal';
import { useUserState } from '../../lib/auth-token-context';
import { toast } from '../../lib/toast';
import { UserStateStatus } from '../../lib/types/user-states';
import { Text } from '../base';
import { DarkModeModal } from '../DarkModeModal';

interface DropdownMenuItemProps {
  onClick: () => void;
  text: string;
  className?: string;
}

function DropdownMenuItem(props: DropdownMenuItemProps) {
  const { onClick, text, className } = props;
  return (
    <Menu.Item>
      {({ active }) => {
        const styles = clsx({
          'group flex w-full items-center rounded-md px-4 py-1.5 text-sm': true,
          'bg-grayLight-10 dark:bg-grayDark-40': active,
          [`${className}`]: true,
        });
        return (
          <button className={styles} onClick={onClick}>
            <Text>{text}</Text>
          </button>
        );
      }}
    </Menu.Item>
  );
}

export function Dropdown() {
  const router = useRouter();

  const userIsCurrentlyOnboarding = [
    '/onboarding/begin',
    '/onboarding',
    '/onboarding/signup',
  ].includes(router.pathname);

  const userState = useUserState();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const { data: loginStatusData, isLoading: loadingLoginStatusData } =
    useLoginStatus();

  const isLoggedIn =
    loginStatusData?.loggedIn &&
    userState.status !== UserStateStatus.SIGNED_OUT;

  const [isOpen, handlers] = useModal(false);

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => {
        const caretStyles = clsx({
          'h-7 w-7 transition': true,
          'rotate-180': open,
        });

        return (
          <>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                className={`absolute right-0 top-full z-10 mt-2 w-56 origin-top-right rounded-md border 
                  border-grayLight-20  bg-white py-2 shadow-sm ring-1 ring-black
                  ring-opacity-5 focus:outline-none dark:border-grayDark-40 dark:bg-grayDark-20 dark:shadow-grayDark-20`}
              >
                {isLoggedIn ? (
                  <>
                    {loginStatusData?.loggedIn && !userIsCurrentlyOnboarding && (
                      <>
                        <DropdownMenuItem
                          text={'Settings'}
                          onClick={() => {
                            router.push('/account');
                          }}
                        />
                        <DropdownMenuItem
                          text={'Support / FAQ'}
                          onClick={() => {
                            router.push('/support');
                          }}
                        />
                      </>
                    )}
                    <DropdownMenuItem
                      text={'Appearance'}
                      onClick={() => {
                        handlers.open();
                      }}
                    />

                    <div className="my-0.5 h-px w-full bg-grayLight-20 dark:bg-grayDark-50"></div>
                    <Menu.Item>
                      {({ active }) => {
                        const styles = clsx({
                          'group flex w-full items-center rounded-md px-4 py-1.5 text-sm':
                            true,
                          'bg-grayLight-10 dark:bg-grayDark-40': active,
                        });
                        return (
                          <button
                            className={styles}
                            onClick={() => {
                              setIsSigningOut(true);
                              userState
                                .signOut()
                                .catch((err: Error) => {
                                  toast.error(`Error: ${err.message}`);
                                })
                                .finally(() => {
                                  router.push('/').then(() => {
                                    setIsSigningOut(false);
                                  });
                                });
                            }}
                          >
                            <Text color="error">Log out</Text>
                          </button>
                        );
                      }}
                    </Menu.Item>
                  </>
                ) : (
                  <div />
                )}
              </Menu.Items>
            </Transition>

            <Menu.Button className="focus:outline-none">
              <div className="rounded-full border-grayLight-50 px-3 py-1.5 transition hover:bg-grayLight-20 dark:hover:bg-grayDark-40 ">
                <div className="flex items-center gap-2 text-md text-grayLight-70 dark:text-grayDark-120">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="h-3.5 w-3.5 dark:text-grayDark-80"
                  />
                  <Text isLoading={loadingLoginStatusData} loadingWidth="8rem">
                    {loginStatusData?.loggedIn
                      ? loginStatusData.user.displayName
                      : '---'}
                  </Text>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className="h-2 w-2 shrink-0"
                  />
                </div>
              </div>
            </Menu.Button>

            <DarkModeModal isOpen={isOpen} onClose={handlers.close} />
          </>
        );
      }}
    </Menu>
  );
}
