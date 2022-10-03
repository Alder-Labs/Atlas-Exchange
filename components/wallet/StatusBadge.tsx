import React from 'react';

import clsx from 'clsx';

import { Text } from '../base';

function getStatusColorStyle(status: string) {
  return clsx({
    // 'border-success dark:border-successDark': status === 'complete',
    // 'border-error dark:border-errorDark': status === 'failed',
    // 'dark:border-grayDark-60': status === 'sent',
    'dark:border-grayDark-60': true,
  });
}

function getTextColor(status: string) {
  return 'normal';
  if (status === 'complete') {
    return 'success';
  } else {
    return 'secondary';
  }
}
export function StatusBadge(props: { status: string }) {
  const { status } = props;

  return (
    <div
      className={clsx(
        'flex items-center rounded-md border py-0.5 px-2',
        getStatusColorStyle(status)
      )}
    >
      <Text color={getTextColor(status)} weight="semibold" size="sm">
        {status}
      </Text>
    </div>
  );
}
