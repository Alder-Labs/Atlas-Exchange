import React from 'react';

import { Navbar } from './Navbar';
import { SidePadding } from './SidePadding';

export function Layout({
  children,
  showFooter = false,
}: {
  children: React.ReactNode;
  showFooter?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black">
      <Navbar />

      <main className="flex flex-1 flex-col">{children}</main>

      {showFooter && (
        <footer>
          <SidePadding className="bg-grayLight-90">
            <div className="h-48"></div>
          </SidePadding>
        </footer>
      )}
    </div>
  );
}
