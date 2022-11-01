import React, { useEffect } from 'react';

import { useRouter } from 'next/router';
import { useMutation } from 'react-query';

import { Spinner } from '../../components/base';
import { SidePadding } from '../../components/layout/SidePadding';
import { useUserState } from '../../lib/auth-token-context';
import { useFormMutationFetcher } from '../../lib/formMutation';
import { toast } from '../../lib/toast';
import {
  CustomPage,
  SupportOnlyTokenRequest,
  SupportOnlyTokenResponse,
} from '../../lib/types';
import { UserStateStatus } from '../../lib/types/user-states';

const ConsumeCode: CustomPage = () => {
  const userState = useUserState();
  const router = useRouter();

  const { code } = router.query;
  const isSignedOut = userState.status === UserStateStatus.SIGNED_OUT;

  const {
    isLoading: fetchSupportOnlyTokenIsLoading,
    mutate: fetchSupportOnlyToken,
  } = useMutation(
    useFormMutationFetcher<SupportOnlyTokenRequest, SupportOnlyTokenResponse>(
      `/proxy/api/support/support_only_token`
    ),
    {
      onSuccess: (data) => {
        userState.updateToken(data.result).then(() => {
          router.push('/support');
        });
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  useEffect(() => {
    if (!isSignedOut) {
      router.push('/support');
      return;
    }

    if (code) {
      fetchSupportOnlyToken({ code: code as string });
      return;
    }
  }, [isSignedOut, router, code, fetchSupportOnlyToken]);

  return (
    <SidePadding>
      {fetchSupportOnlyTokenIsLoading ? <Spinner /> : null}
    </SidePadding>
  );
};

export default ConsumeCode;
