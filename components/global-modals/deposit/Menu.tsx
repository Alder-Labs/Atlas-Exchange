import React from 'react';

import {
  faAngleRight,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';

import { Text } from '../../base';

export interface MenuItemProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
  description?: React.ReactNode;
  onClick?: () => void;
}

export const MenuIconLeft = (props: { icon: IconDefinition }) => {
  return (
    <div className="min-h-10 flex shrink-0 items-center">
      <div className="dark:bg-grayDark-50 bg-grayLight-50 ml-3 mr-5 flex h-10 w-10 items-center justify-center rounded-full">
        <FontAwesomeIcon icon={props.icon} className="h-4" />
      </div>
    </div>
  );
};

export const MenuIconRight = (props: { icon: IconDefinition }) => {
  return (
    <Text>
      <div className="ml-4 mr-2 w-3 shrink-0">
        <FontAwesomeIcon icon={props.icon} />
      </div>
    </Text>
  );
};

export const MenuItem = (props: MenuItemProps) => {
  const {
    leftIcon,
    rightIcon = <MenuIconRight icon={faAngleRight} />,
    title,
    subtitle,
    description,
    onClick,
  } = props;

  const divBtnStyle = clsx({
    ['w-full py-5 px-4 duration-300']: true,
    ['cursor-pointer hover:bg-grayLight-30 dark:hover:bg-grayDark-40']: onClick,
  });

  return (
    <div className="max-w-full basis-full">
      <div className={divBtnStyle} onClick={onClick}>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-2">
            {leftIcon}
            <div className="flex flex-row">
              <div className="flex flex-col items-start justify-start">
                {title}
                {subtitle && (
                  <>
                    <div className="h-2"></div>
                    <Text className="text-start" color="brand">
                      {subtitle}
                    </Text>
                  </>
                )}
                <div className="h-2" />
                {description}
              </div>
              <div className="flex h-full flex-col justify-center">
                {rightIcon}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
