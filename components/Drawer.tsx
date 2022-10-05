import { ReactNode, useCallback, useEffect, useRef } from 'react';

import { Transition } from '@headlessui/react';
import { createPortal } from 'react-dom';

function getAppRoot() {
  if (typeof document === 'undefined') return null;
  return document.getElementById('__next');
}

interface DrawerProps {
  isOpen: boolean;
  children: ReactNode;
  widthClassName?: string;
  closedClassName?: string;
  openClassName?: string;
  onRequestClose: () => void;
}
const Drawer = ({
  isOpen = false,
  widthClassName = 'w-96',
  closedClassName = '-left-96',
  openClassName = 'left-0',
  children,
  onRequestClose,
}: DrawerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const handleClickOutside = useCallback(
    (event: Event) => {
      if (ref.current && !ref.current!.contains(event.target as Node)) {
        onRequestClose();
      }
    },
    [onRequestClose]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.addEventListener('click', handleClickOutside, false);
    return () => {
      window.removeEventListener('click', handleClickOutside, false);
    };
  }, [handleClickOutside]);

  const appRoot = getAppRoot();

  if (!appRoot) return <></>;

  return createPortal(
    <Transition
      show={isOpen}
      className={`fixed top-0 z-40 h-screen overflow-y-auto shadow-md dark:bg-grayDark-40 ${widthClassName} ${closedClassName}`}
      enter="ease-out duration-200"
      enterFrom={closedClassName}
      enterTo={openClassName}
      entered={openClassName}
      leave="ease-in duration-200"
      leaveFrom={openClassName}
      leaveTo={closedClassName}
    >
      <div ref={ref} className="h-full w-full bg-white">
        <div className="h-full w-full bg-white">{children}</div>
      </div>
    </Transition>,
    appRoot
  );
};

export default Drawer;
