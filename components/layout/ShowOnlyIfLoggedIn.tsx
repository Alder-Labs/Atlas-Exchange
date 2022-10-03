import React from 'react';

import { useInit } from '../../hooks/useInit';
import { useLoginStatus } from '../../hooks/useLoginStatus';
import { useUserState } from '../../lib/auth-token-context';
import { BRAND_NAME } from '../../lib/constants';

function Wrapper({ children }: { children: React.ReactNode }) {
  useInit();

  const { data } = useLoginStatus();

  if (data?.user?.kycLevel !== undefined && data.user.kycLevel < 1) {
    return <div>You need to complete your KYC to access {BRAND_NAME}</div>;
  }

  return <>{children}</>;
}
export function ShowOnlyIfLoggedIn({
  children,
  ...rest
}: {
  children: React.ReactNode;
}) {
  const userState = useUserState();

  // TODO: Add loading state
  return userState.user ? (
    <Wrapper>{children}</Wrapper>
  ) : (
    <div>Not logged in</div>
  );
}
