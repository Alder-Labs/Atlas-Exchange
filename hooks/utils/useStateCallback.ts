import {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

type SetStateWithCallback<T> = (
  state: T | ((prev: T) => T),
  cb?: (state: T) => void
) => void;

export function useStateCallback<T>(
  initialState: T
): [T, SetStateWithCallback<T>] {
  const [state, setState] = useState(initialState);
  const cbRef = useRef<((state: T) => void) | undefined>(undefined); // init mutable ref container for callbacks

  const setStateCallback = useCallback(
    (state: SetStateAction<T>, cb?: (state: T) => void) => {
      cbRef.current = cb; // store current, passed callback in ref
      setState(state);
    },
    []
  ); // keep object reference stable, exactly like `useState`

  useEffect(() => {
    // cb.current is `undefined` on initial render,
    // so we only invoke callback on state *updates*
    if (cbRef.current) {
      cbRef.current(state);
      cbRef.current = undefined; // reset callback after execution
    }
  }, [state]);

  return [state, setStateCallback];
}
