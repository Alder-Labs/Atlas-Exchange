import { ReactNode } from 'react';

import { Popover as HeadlessPopover, Transition } from '@headlessui/react';
import clsx from 'clsx';

interface PopoverProps {
  children: ReactNode;
  renderPanel: ({ close }: { close: () => void }) => ReactNode;
  className?: string;
}

export const Popover = ({ children, renderPanel, className }: PopoverProps) => {
  return (
    <HeadlessPopover className={clsx('relative outline-none', className)}>
      {({ open }) => (
        <>
          {children}

          {/* Use the Transition component. */}
          <Transition
            show={open}
            className="z-20"
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-90 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-90 opacity-0"
          >
            {/* Mark this component as `static` */}
            <HeadlessPopover.Panel className="z-10" static>
              {({ close }) => <>{renderPanel({ close })}</>}
            </HeadlessPopover.Panel>
          </Transition>
        </>
      )}
    </HeadlessPopover>
  );
};

Popover.Button = HeadlessPopover.Button;
