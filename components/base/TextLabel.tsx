import React, { HTMLAttributes } from 'react';

export const TextLabel = ({ children }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <label className="dark:text-grayDark-80 block text-sm font-medium text-black">
      {children}
    </label>
  );
};
