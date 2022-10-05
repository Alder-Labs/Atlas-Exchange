import React, { HTMLAttributes } from 'react';

export const TextLabel = ({ children }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <label className="block text-sm font-medium text-black dark:text-grayDark-80">
      {children}
    </label>
  );
};
