import React from 'react';

import {
  faAngleRight,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import clsx from 'clsx';

import { Text } from '../base';
import { MenuIconRight } from '../global-modals/deposit/Menu';

export function DisabledMenuItemOverlay({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="z-10 flex max-w-xs rounded-md bg-white p-4 shadow-md dark:bg-grayDark-20">
        {children}
      </div>
    </div>
  );
}

export interface MenuItemProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
  description?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  disabledDescription?: React.ReactNode;
}

export const MenuItem = (props: MenuItemProps) => {
  const {
    leftIcon,
    rightIcon = <MenuIconRight icon={faAngleRight} />,
    title,
    subtitle,
    description,
    onClick,
    disabled,
    disabledDescription,
  } = props;

  const divBtnStyle = clsx({
    ['w-full py-5 px-4 duration-300']: true,
    ['cursor-pointer hover:bg-grayLight-10 dark:hover:bg-grayDark-40']:
      onClick && !disabled,
    'cursor-not-allowed blur-md select-none': disabled,
  });

  return (
    <div className="relative max-w-full basis-full">
      {disabled && (
        <div className="absolute inset-0">{disabledDescription}</div>
      )}

      <div
        className={divBtnStyle}
        onClick={() => {
          if (!disabled) {
            onClick?.();
          }
        }}
      >
        <div className="flex flex-row justify-between">
          <div className="flex w-full flex-row gap-2">
            {leftIcon}
            <div className="flex w-full flex-row">
              <div className="flex w-full flex-col items-start justify-start">
                {title}
                {subtitle && (
                  <>
                    <div className="h-0.5"></div>
                    <Text className="text-start" color="brand">
                      {subtitle}
                    </Text>
                  </>
                )}
                <div className="h-2" />
                {description}
              </div>
              <div className="flex h-full flex-col justify-center">
                {rightIcon ?? <MenuIconRight icon={faChevronRight} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
