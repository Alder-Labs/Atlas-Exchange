import { atom } from 'jotai';

import { ModalState, ModalStateDetailed } from './types/modalState';

export const buyCoinIdAtom = atom<string | null>(null);

export const bscFocusedAtom = atom<boolean>(false);

export const globalModalStateDetailedAtom = atom<ModalStateDetailed>({
  state: ModalState.Closed,
});

export const globalModalStateDetailedStackAtom = atom<ModalStateDetailed[]>([]);

export const sardineDeviceIdAtom = atom<string | null>(null);
