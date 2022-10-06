import reactHotToast, { ToastIcon } from 'react-hot-toast';

import { Text } from '../components/base';
/**
 * Limit API surface area used in case we want to swap things out with our own implementation.
 *
 * Or if we want to restyle using `toast.custom` + tailwindCSS (we probably will do this)
 */

interface ToastHandlers {
  success: (message: string) => void;
  error: (message: string, options?: { id: string }) => void;
}

export const toast: ToastHandlers = {
  success: (message) => {
    return reactHotToast.custom((toast) => {
      return (
        <div
          className={`${
            toast.visible ? 'animate-enter' : 'animate-leave'
          } pointer-events-auto flex w-full max-w-md rounded-lg bg-white 
           shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-grayDark-40`}
        >
          <div className="flex items-center gap-3 p-4">
            <ToastIcon toast={{ ...toast, type: 'success' }} />
            <Text>{message}</Text>
          </div>
        </div>
      );
    });
  },
  error: (message, options) => {
    return reactHotToast.custom((toast) => {
      return (
        <div
          className={`${
            toast.visible ? 'animate-enter' : 'animate-leave'
          } pointer-events-auto flex w-full max-w-md rounded-lg bg-white 
           shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-grayDark-40`}
        >
          <div className="flex items-center gap-3 p-4">
            <ToastIcon toast={{ ...toast, type: 'error' }} />
            <Text>{message}</Text>
          </div>
        </div>
      );
    }, options);
  },
};
