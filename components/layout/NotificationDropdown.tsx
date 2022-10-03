import React, { Fragment, useMemo, useState } from 'react';

import { faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';

import { useNotifications } from '../../hooks/useNotifications';
import { useUserState } from '../../lib/auth-token-context';
import { formatDate } from '../../lib/date';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { Notification } from '../../lib/types/notification';
import { Button, Spinner, Text, TextButton, Title } from '../base';
import { Badge } from '../notifications/badge';

interface NotificationMenuItemProps {
  className?: string;
  notification: Notification;
}

function NotificationMenuItem(props: NotificationMenuItemProps) {
  const { notification, className } = props;

  const [bodyIsExpanded, setBodyIsExpanded] = useState(false);
  const onClick = () => {
    setBodyIsExpanded(!bodyIsExpanded);
  };

  const primaryStyle = clsx({
    'flex py-4 px-6 text-sm text-left': true,
    'bg-white dark:bg-grayDark-20 hover:bg-grayLight-20 dark:hover:bg-grayDark-40 duration-100':
      true,
    [`${className}`]: true,
  });

  return (
    <button onClick={onClick} className={primaryStyle}>
      <div className={'flex w-full flex-col break-words'}>
        <Text className={'mb-1'}>
          <Text className="font-bold">{notification.subject} &#10625; </Text>
          {formatDate(new Date(notification.created_at))}
        </Text>
        <Text
          color="secondary"
          size="sm"
          className={!bodyIsExpanded ? 'line-clamp-3' : ''}
        >
          {notification.body}
        </Text>
      </div>
    </button>
  );
}

enum NotificationState {
  None,
  Loading,
  OldNotificationsPresent,
  NewNotificationsPresent,
}

export function NotificationDropdown() {
  const router = useRouter();
  const userState = useUserState();
  const isLoggedIn = !!userState.user;

  const {
    data: notifications,
    isLoading: notificationsAreLoading,
    refetch: refetchNotifications,
  } = useNotifications({
    enabled: isLoggedIn,
  });

  const { isLoading: markAllReadIsLoading, mutate: markAllRead } = useMutation(
    useMutationFetcher<{}, {}>(
      `/proxy/api/notifications/mark_all_for_user_as_read`,
      {
        onFetchSuccess: async () => {
          await refetchNotifications();
        },
      }
    ),
    {
      onSuccess: () => {
        toast.success('Successfully marked all notifications as read');
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  const numOfUnreadNotifications = useMemo(() => {
    return !notifications ? 0 : notifications.filter((n) => n.unread).length;
  }, [notifications]);

  const notificationState: NotificationState = useMemo(() => {
    return notificationsAreLoading
      ? NotificationState.Loading
      : notifications && numOfUnreadNotifications > 0
      ? NotificationState.NewNotificationsPresent
      : notifications && notifications.length > 0
      ? NotificationState.OldNotificationsPresent
      : NotificationState.None;
  }, [notifications, notificationsAreLoading, numOfUnreadNotifications]);

  const renderNotifications = useMemo(() => {
    switch (notificationState) {
      case NotificationState.Loading:
        return (
          <div className="flex h-24 w-full items-center justify-center">
            <Spinner />
          </div>
        );
      case NotificationState.NewNotificationsPresent:
        return (
          <div className={'flex flex-col'}>
            {notifications
              ?.slice(0, 3)
              .map(
                (notification) =>
                  notification.unread && (
                    <NotificationMenuItem
                      key={notification.id}
                      notification={notification}
                    />
                  )
              )}
          </div>
        );
      case NotificationState.OldNotificationsPresent:
        return (
          <div className="flex flex-col items-center space-y-4 py-4 px-6">
            <Text color="secondary">No unread notifications. </Text>
          </div>
        );
      case NotificationState.None:
        return (
          <div className="flex flex-col items-center space-y-4 py-4 px-6">
            <Text color="secondary">
              No notifications yet. Messages and alerts about your account will
              show up here.{' '}
            </Text>
          </div>
        );
      default:
        return <></>;
    }
  }, [notifications, notificationState]);

  const renderSeeAllButton = () => {
    const seeAll = () => {
      router.push('/notifications');
    };

    switch (notificationState) {
      case NotificationState.OldNotificationsPresent:
        return (
          // Headless UI Menu.Item closes the menu on click
          <Menu.Item>
            <div className="flex justify-center px-6 pb-4">
              <Button variant="secondary" onClick={seeAll}>
                See All
              </Button>
            </div>
          </Menu.Item>
        );
      case NotificationState.NewNotificationsPresent:
        return (
          <Menu.Item>
            <div className="flex justify-center px-6 pb-4">
              <Button variant="secondary" onClick={seeAll}>
                See All
              </Button>
            </div>
          </Menu.Item>
        );
      case NotificationState.Loading:
        return (
          <div className="flex justify-center px-6 pb-4">
            <Button disabled={true} variant="secondary">
              See All
            </Button>
          </div>
        );
      case NotificationState.None:
        return (
          <div className="flex justify-center px-6 pb-4">
            <Button disabled={true} variant="secondary">
              See All
            </Button>
          </div>
        );
      default:
        return <></>;
    }
  };

  const renderMarkAllReadButton = () => {
    return (
      <TextButton
        size="md"
        onClick={() => {
          markAllRead({});
        }}
        disabled={
          notificationState !== NotificationState.NewNotificationsPresent
        }
      >
        Mark All as Read
      </TextButton>
    );
  };

  const renderNotificationIcon = () => {
    const primaryIconStyles = clsx({
      'flex h-8 w-8 items-center justify-center rounded-full p-2': true,
      'transition bg-grayLight-20 border border-grayLight-20 dark:border-transparent hover:brightness-95 text-grayLight-70 dark:bg-grayDark-50 dark:text-grayDark-90 dark:hover:bg-grayDark-60':
        true,
    });
    const primaryBadgePositionStyle = clsx({
      'absolute top-0 right-0 translate-x-1.5 -translate-y-1.5': true,
    });
    return (
      <Menu.Button className="focus:outline-none">
        <div className="text-md text-grayLight-90 dark:text-grayDark-120 flex items-center gap-2">
          <div className={primaryIconStyles}>
            <FontAwesomeIcon icon={faBell} className="h-3.5 w-3.5" />
          </div>
          <div className={primaryBadgePositionStyle}>
            <Badge number={numOfUnreadNotifications} />
          </div>
        </div>
      </Menu.Button>
    );
  };

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
                className="dark:bg-grayDark-20 dark:shadow-grayDark-20 dark:border-grayDark-40 border-grayLight-20 absolute right-0
                  top-full z-10 mt-2 w-96 origin-top-right
                  overflow-hidden rounded-md border bg-white shadow-sm
                  ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                {isLoggedIn ? (
                  <div className={'w-96'}>
                    <div className="dark:border-grayDark-40 border-grayLight-30 flex flex-row justify-between border-b px-6 py-4">
                      <Title>Notifications</Title>
                      <Menu.Item>{renderMarkAllReadButton()}</Menu.Item>
                    </div>
                    <div className={' w-full'}>{renderNotifications}</div>
                    {numOfUnreadNotifications - 3 > 0 && (
                      <div className="px-4">
                        <Text color="secondary">
                          + {numOfUnreadNotifications - 3} more...
                        </Text>
                      </div>
                    )}
                    <div className="h-4"></div>
                    {renderSeeAllButton()}
                  </div>
                ) : (
                  <></>
                )}
              </Menu.Items>
            </Transition>
            {renderNotificationIcon()}
          </>
        );
      }}
    </Menu>
  );
}
