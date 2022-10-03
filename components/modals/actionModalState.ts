import { useCallback, useMemo } from 'react';

import { useRouter } from 'next/router';

export enum ActionModalState {
  Closed = 'closed',
  Deposit = 'deposit',
  Withdraw = 'withdraw',
  Send = 'send',
  Receive = 'receive',
}

const ALL_MODAL_STATES = Object.values(ActionModalState);

export function useActionModalState() {
  const router = useRouter();

  const state = useMemo(() => {
    const param = router.query.action as ActionModalState;
    return param && ALL_MODAL_STATES.includes(param)
      ? param
      : ActionModalState.Closed;
  }, [router.query.action]);

  const updateState = useCallback(
    (newState: ActionModalState) => {
      if (newState === ActionModalState.Closed) {
        const searchParams = new URLSearchParams(router.query as any);
        searchParams.delete('action');
        router.replace(
          { pathname: router.pathname, query: searchParams.toString() },
          undefined,
          { shallow: true }
        );
      } else {
        router.replace(
          {
            pathname: router.pathname,
            query: { ...router.query, action: newState },
          },
          undefined,
          { shallow: true }
        );
      }
    },
    [router]
  );

  return useMemo(() => [state, updateState] as const, [state, updateState]);
}
