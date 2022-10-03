import React from 'react';

export function Warning(props: { children: React.ReactNode }) {
  return (
    <div className="bg-warningDark/25 dark:bg-warningDark/25 rounded-lg p-4">
      {props.children}
    </div>
  );
}
