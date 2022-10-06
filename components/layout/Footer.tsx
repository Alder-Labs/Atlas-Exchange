import Link from 'next/link';

import { Text } from '../base';

import { SidePadding } from './SidePadding';

export const Footer = () => {
  return (
    <footer>
      <SidePadding className="bg-grayLight-10 dark:bg-grayDark-10">
        <div className="flex flex-row justify-between px-8 py-8">
          <div className="flex flex-col">
            <Text color="secondary">
              <Link href="/">Home</Link>
            </Text>
            <div className="h-4" />
            <Text color="secondary">
              <Link href="/wallet">Wallet</Link>
            </Text>
            <div className="h-4" />
            <Text color="secondary">
              <Link href="/account">Settings</Link>
            </Text>
          </div>
          <div className="flex flex-col">
            <Text color="secondary">
              <Link href="/support">Support</Link>
            </Text>
            <div className="h-4" />
            <Text color="secondary">
              <a
                href="https://hackerone.com/brave"
                target="_blank"
                rel="noreferrer"
              >
                Report a bug
              </a>
            </Text>
          </div>
        </div>
      </SidePadding>
    </footer>
  );
};
