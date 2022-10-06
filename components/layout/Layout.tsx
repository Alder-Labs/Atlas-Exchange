import React from 'react';
import { Footer } from './Footer';

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

      {showFooter && <Footer />}
    </div>
  );
}
