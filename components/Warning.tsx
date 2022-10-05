import React from 'react';

export function Warning(props: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-warningDark/25 p-4 dark:bg-warningDark/25">
      {props.children}
    </div>
  );
}
