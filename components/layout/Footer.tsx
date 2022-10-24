import Link from 'next/link';
import React from 'react';
import { useDarkOrLightMode } from '../../lib/dark-mode';

import { Text } from '../base';
import { BrandLogo } from '../BrandLogo';

import { SidePadding } from './SidePadding';

export const Footer = () => {
  const darkMode = useDarkOrLightMode();

  return (
    <footer>
      <SidePadding className="bg-grayLight-10 dark:bg-grayDark-10">
        <div className="flex flex-row items-start justify-between py-8 lg:px-8">
          <div className="ml-4 lg:ml-0">
            <BrandLogo className="w-16" />
          </div>
          <div className="flex flex-row">
            <div className="mr-6 flex flex-col lg:mr-16">
              <FooterHeader>Pages</FooterHeader>
              <div className="h-4" />
              <FooterLink href="/">Home</FooterLink>
              <div className="h-4" />
              <FooterLink href="/wallet">Wallet</FooterLink>
              <div className="h-4" />
              <FooterLink href="/account">Settings</FooterLink>
            </div>
            <div className="mr-4 flex flex-col lg:mr-16">
              <FooterHeader>Help Center</FooterHeader>
              <div className="h-4" />
              <FooterLink href="/support">Support</FooterLink>
              <div className="h-4" />
              <Text color="secondary" hoverColor="normal">
                <a
                  href="https://hackerone.com/atlas"
                  target="_blank"
                  rel="noreferrer"
                >
                  Report a bug
                </a>
              </Text>
            </div>
          </div>
        </div>
      </SidePadding>
    </footer>
  );
};

const FooterHeader = (props: { children: React.ReactNode }) => {
  return <Text>{props.children}</Text>;
};

const FooterLink = (props: { children: React.ReactNode; href: string }) => {
  return (
    <Text color="secondary" hoverColor="normal">
      <Link href={props.href}>{props.children}</Link>
    </Text>
  );
};
