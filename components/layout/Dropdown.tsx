import { Fragment } from 'react';

import { faChevronDown, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { useRouter } from 'next/router';

import { useLoginStatus } from '../../hooks/useLoginStatus';
import { useModal } from '../../hooks/useModal';
import { useUserState } from '../../lib/auth-token-context';
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
  const isLoggedIn = !!userState.user;

  const { data: loginStatusData, isLoading: loadingLoginStatusData } =
    useLoginStatus();

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
                className={`dark:bg-grayDark-20 dark:shadow-grayDark-20 dark:border-grayDark-40 border-grayLight-20 absolute right-0 top-full z-10 mt-2 
                  w-56  origin-top-right rounded-md border bg-white py-2
                  shadow-sm ring-1 ring-black ring-opacity-5 focus:outline-none`}
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

                    <div className="dark:bg-grayDark-50 bg-grayLight-20 my-0.5 h-px w-full"></div>
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
                              userState.signout();
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
              <div className="dark:hover:bg-grayDark-40 border-grayLight-50 hover:bg-grayLight-20 rounded-full px-3 py-1.5 transition ">
                <div className="text-md dark:text-grayDark-120 text-grayLight-70 flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="dark:text-grayDark-80 h-3.5 w-3.5"
                  />
                  <Text isLoading={loadingLoginStatusData} loadingWidth="8rem">
                    {loginStatusData?.loggedIn
                      ? loginStatusData.user.displayName
                      : 'Not logged in'}
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
