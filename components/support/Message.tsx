import React, { HTMLAttributes } from 'react';

import clsx from 'clsx';

import { SupportTicketMessage } from '../../lib/types';
import { Text } from '../base';

export const Message = ({
  authorIsUser,
  message,
  uploadedFileName,
  time,
}: HTMLAttributes<HTMLDivElement> &
  SupportTicketMessage & { authorIsUser: boolean }) => {
  const authorIsUserStyle = clsx({
    'flex flex-col bg-grayLight-30 dark:bg-grayDark-40 border-none': true,
    'rounded-tr-2xl rounded-tl-2xl rounded-bl-3xl ': true,
    border: true,
  });

  const authorIsSupportStyle = clsx({
    'flex flex-col bg-grayLight-90 border-none': true,
    'rounded-tr-2xl rounded-tl-2xl rounded-br-3xl': true,
    border: true,
  });

  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleString();
  };

  return (
    <div
      className={clsx(
        'mb-4 flex w-full flex-row',
        authorIsUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div className={authorIsUser ? authorIsUserStyle : authorIsSupportStyle}>
        <div className="w-full max-w-2xl whitespace-normal break-words py-4 px-6">
          <Text className="block">{message}</Text>
          {uploadedFileName && (
            <Text size="sm" className="my-1 block">
              Attached Filename:{' '}
              {uploadedFileName.length > 40
                ? `${uploadedFileName.substring(0, 40)}...`
                : `${uploadedFileName}`}
            </Text>
          )}
          <Text size="sm" color="secondary" className="block">
            {formatTime(time)}
          </Text>
        </div>
      </div>
    </div>
  );
};
