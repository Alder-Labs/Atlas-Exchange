import React, {
  forwardRef,
  Fragment,
  HTMLAttributes,
  MutableRefObject,
  ReactNode,
} from 'react';

import { Dialog, Transition } from '@headlessui/react';
import clsx from 'clsx';

export const ModalBackdrop = forwardRef<HTMLDivElement, { className?: string }>(
  (props, ref) => {
    const { className } = props;

    const styles = clsx({
      'fixed inset-0 bg-black/30 backdrop-blur dark:bg-black/50': true,
      [`${className}`]: true,
    });
    return <div ref={ref} className={styles} />;
  }
);
ModalBackdrop.displayName = 'ModalBackdrop';

export type ModalProps = HTMLAttributes<HTMLDivElement> & {
  isOpen: boolean;
  onClose?: () => void;
  children?: ReactNode;
  initialFocus?: MutableRefObject<HTMLElement | null>;
  darkenBackground?: boolean;
};

export const Modal = ({
  children,
  isOpen,
  onClose = () => {},
  darkenBackground = true,
}: ModalProps) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} open={isOpen} className="fixed inset-0 z-50">
        {darkenBackground && (
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ModalBackdrop />
          </Transition.Child>
        )}

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="inline-block h-screen align-middle" aria-hidden="true">
          &#8203;
        </span>

        <Transition.Child
          as={'div'}
          className="fixed inset-0 flex items-center justify-center"
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="mx-2 max-h-[95vh] w-full max-w-md overflow-auto">
            {children}
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

Modal.Title = Dialog.Title;

Modal.Description = Dialog.Description;
