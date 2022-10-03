import { useMemo, useCallback, useEffect } from 'react';

import { useAtom } from 'jotai';

import {
  globalModalStateDetailedAtom,
  globalModalStateDetailedStackAtom,
} from '../lib/jotai';
import { ModalState, ModalStateDetailed } from '../lib/types/modalState';

export function useModalState() {
  const [state, _setState] = useAtom(globalModalStateDetailedAtom);
  const [navStack, setNavStack] = useAtom(globalModalStateDetailedStackAtom);

  const setState = useCallback(
    (newState: ModalStateDetailed) => {
      _setState(newState);
      setNavStack((stack) => {
        if (newState.state === ModalState.Closed) {
          return [];
        } else {
          return [...stack, newState];
        }
      });
    },
    [_setState, setNavStack]
  );

  useEffect(() => {
    if (state.state === ModalState.Closed) {
      setNavStack([]);
    }
  }, [state, setNavStack]);

  const handlers = useMemo(
    () => ({
      goBack() {
        const topOfStack = navStack[navStack.length - 1];

        if (topOfStack) {
          const secondToTopOfStack = navStack[navStack.length - 2];
          setNavStack((stack) => stack.slice(0, -1));
          _setState(secondToTopOfStack);
        } else {
          setNavStack([]);
          _setState({ state: ModalState.Closed });
        }
      },
    }),
    [_setState, navStack, setNavStack]
  );

  return useMemo(
    () => [state, setState, handlers] as const,
    [handlers, setState, state]
  );
}
