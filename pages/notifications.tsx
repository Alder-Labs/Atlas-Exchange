import React from 'react';

import { useMutation } from 'react-query';

import { Text, TextButton, Title } from '../components/base';
import { SidePadding } from '../components/layout/SidePadding';
import { Table } from '../components/table';
import { useNotifications } from '../hooks/utils';
import { useMutationFetcher } from '../lib/mutation';
import { toast } from '../lib/toast';
import { CustomPage } from '../lib/types';
import { Notification } from '../lib/types/notification';

const formatTime = (time: string) => {
  const date = new Date(time);
  return date.toLocaleString();
};

const Notifications: CustomPage = () => {
  const { data: notifications, isLoading: notificationsAreLoading } =
    useNotifications({
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    });

  const { isLoading: markAllReadIsLoading, mutate: markAllRead } = useMutation(
    useMutationFetcher<{}, {}>(
      `/proxy/api/notifications/mark_all_for_user_as_read`
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

  return (
    <SidePadding>
      <div className="sm:px-8">
        <div className="h-12" />
        <div className={'flex flex-row items-end justify-between'}>
          <Title>Notifications</Title>
          <TextButton onClick={() => markAllRead({})}>
            Mark all as read
          </TextButton>
        </div>
        <div className="h-4" />
        <Table
          tableClassName="w-full table-fixed"
          data={notifications ?? []}
          loading={notificationsAreLoading}
          loadingRows={3}
          renderEmpty={() => (
            <div className="flex flex-row items-center">
              <Text className="block" weight="bold">
                No Notifications.
              </Text>
            </div>
          )}
          noHeader={true}
          paginated={true}
          columns={[
            {
              type: 'custom',
              label: null,
              renderLoading() {
                return <></>;
              },
              renderCell: (row: Notification) => {
                return (
                  <div className={'border-b border-b-grayLight-90'}>
                    <div className="h-4" />
                    <div className="flex flex-row items-center justify-between">
                      <Text className="" weight="bold">
                        {row.subject}
                      </Text>
                      <Text className="">{row.notification_type}</Text>
                    </div>
                    <Text className="mt-2 block" color="secondary">
                      {row.body}
                    </Text>
                    <Text className="mt-4 block" color="secondary" size="sm">
                      {formatTime(row.created_at)}
                    </Text>
                    <div className={'h-4'} />
                  </div>
                );
              },
            },
          ]}
        />
      </div>
      <div className="h-12" />
    </SidePadding>
  );
};

export default Notifications;
