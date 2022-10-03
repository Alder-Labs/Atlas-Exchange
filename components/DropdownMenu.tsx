import { Fragment, useState } from 'react';

import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';

import { Text } from './base';

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
          'group flex w-full items-center px-4 py-1.5 text-sm text-left': true,
          'bg-white dark:bg-grayDark-20': !active,
          'bg-grayLight-10 dark:bg-grayDark-40': active,
          [`${className}`]: true,
        });
        return (
          <button className={styles} onClick={onClick}>
            <Text className="w-full">{text}</Text>
          </button>
        );
      }}
    </Menu.Item>
  );
}

interface DropdownMenuProps {
  options: {
    text: string;
    onClick: () => void;
  }[];
  children?: React.ReactNode;
  menuItemsClassName?: string;
  menuItemClassName?: string;
}

export function DropdownMenu(props: DropdownMenuProps) {
  const { options, children, menuItemsClassName, menuItemClassName } = props;

  const [isAppearanceMenuOpen, setAppearanceMenuOpen] = useState(false);

  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => {
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
                className={clsx(
                  `border-grayLight-20 dark:bg-grayDark-20 dark:border-grayDark-40 absolute right-0 top-full
                  z-10 mt-2 origin-top-right rounded-md 
                border bg-white py-2
                  shadow-md ring-1 ring-black
                  ring-opacity-5 focus:outline-none`,
                  menuItemsClassName
                )}
              >
                {options.map((option) => (
                  <DropdownMenuItem
                    key={option.text}
                    text={option.text}
                    onClick={option.onClick}
                    className={menuItemClassName}
                  />
                ))}
              </Menu.Items>
            </Transition>

            {children}
          </>
        );
      }}
    </Menu>
  );
}
