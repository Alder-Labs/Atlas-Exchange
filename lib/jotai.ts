import { atom } from 'jotai';

import { ModalState, ModalStateDetailed } from './types/modalState';

export const buyCoinIdAtom = atom<string | null>(null);

export const bscFocusedAtom = atom<boolean>(false);

export const globalModalStateDetailedAtom = atom<ModalStateDetailed>({
  state: ModalState.Closed,
});

export const globalModalStateDetailedStackAtom = atom<ModalStateDetailed[]>([]);

export const sardineDeviceIdAtom = atom<string | undefined>(undefined);

/**
 * Sometimes, after a user does something that might change their balance,
 * we want to continuously refetch their balance for a few seconds.
 *
 * If the current time is less than this atom's value, we will refetch the
 * user's balance every 2 seconds. (in the useBalances hook)
 */
export const watchBalanceUntilAtom = atom<number>(0);
