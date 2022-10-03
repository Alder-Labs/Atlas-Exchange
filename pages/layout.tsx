import React, { ReactNode } from 'react';

import clsx from 'clsx';

import { CustomPage } from '../lib/types';

function Box({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const styles = clsx('bg-grayLight-40 rounded-md p-4', className);
  return <div className={styles}>{children}</div>;
}

const DesignPage: CustomPage = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center">
      <div className="bg-grayLight-20 grid w-full max-w-7xl grid-cols-6 gap-2 p-4">
        <Box className="col-span-4" />
        <Box className="col-span-2" />
      </div>
    </div>
  );
};

// DesignPage.getLayout = (page: ReactNode) => page;

export default DesignPage;
