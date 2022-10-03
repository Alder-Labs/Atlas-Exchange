import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';

export type Trigger = {
  fromCoinId: string;
  toCoinId: string;
  fromAmount: string | null;
  toAmount: string | null;
};

export function useTrigger() {
  const [triggerString, setTriggerString] = useState<string | null>(null);
  const setTrigger: Dispatch<SetStateAction<Trigger | null>> = useCallback(
    (trigger) => {
      if (typeof trigger === 'function') {
        setTriggerString((prev) => {
          const newTrigger = trigger(prev ? JSON.parse(prev) : null);
          return JSON.stringify(newTrigger);
        });
      } else {
        setTriggerString(trigger ? JSON.stringify(trigger) : null);
      }
    },
    []
  );

  const trigger = useMemo(
    () => JSON.parse(triggerString ?? 'null'),
    [triggerString]
  ) as Trigger | null;

  return useMemo(() => ({ trigger, setTrigger }), [trigger, setTrigger]);
}
