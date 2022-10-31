import React, { useEffect } from 'react';

import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';

import { Button, Text } from '../../components/base';
import { DepositCard } from '../../components/deposit/DepositCard';
import { SidePadding } from '../../components/layout/SidePadding';
import { useModalState } from '../../hooks/useModalState';
import { useOAuthClientInfo } from '../../hooks/useOAuthClientInfo';
import { useUserState } from '../../lib/auth-token-context';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { ModalState } from '../../lib/types/modalState';
import { UserStateStatus } from '../../lib/types/user-states';

type OAuthAuthorizeRequest = {
  responseType: string;
  redirectUri: string;
  clientId: string;
  state: string;
};

type OAuthAuthorizeResponse = {
  code: string;
};

const Page: NextPage = () => {
  const userState = useUserState();
  const isLoggedOut = userState.status === UserStateStatus.SIGNED_OUT;
  const [modalState, setModalState, handlers] = useModalState();

  const router = useRouter();
  const { response_type, redirect_uri, client_id, state } = router.query;

  const oauthClientInfoEnabled = typeof client_id === 'string';

  const { data: clientInfo, isLoading: clientInfoIsLoading } =
    useOAuthClientInfo(
      { clientId: oauthClientInfoEnabled ? client_id : '' },
      {
        enabled: oauthClientInfoEnabled,
      }
    );

  const { mutate: authorizeOAuthRequest, isLoading: authorizeIsLoading } =
    useMutation(
      useMutationFetcher<OAuthAuthorizeRequest, OAuthAuthorizeResponse>(
        '/api/oauth2/auth'
      ),
      {
        onSuccess: (data) => {
          router.replace(`${redirect_uri}?code=${data.code}&state=${state}`);
        },
        onError: (err: Error) => {
          toast.error(`Error: ${err.message}`);
        },
      }
    );

  const onClickDeny = () => {
    router.replace(`${redirect_uri}`);
  };

  const onClickAllow = () => {
    if (
      typeof response_type !== 'string' ||
      typeof redirect_uri !== 'string' ||
      typeof client_id !== 'string' ||
      typeof state !== 'string'
    ) {
      toast.error('parameters invalid');
      return;
    }

    if (!redirect_uri.startsWith('https://')) {
      return;
    }

    const data = {
      responseType: response_type,
      redirectUri: redirect_uri,
      clientId: client_id,
      state,
    };
    authorizeOAuthRequest(data);
  };

  useEffect(() => {
    if (isLoggedOut) {
      setModalState({ state: ModalState.SignIn });
    }
  }, [isLoggedOut, setModalState]);

  if (!response_type || !redirect_uri || !client_id || !state) {
    return <div></div>;
  }

  if (clientInfoIsLoading || !clientInfo) {
    return <div></div>;
  }

  return (
    <>
      <SidePadding className="grow">
        <DepositCard title="Authorization Request">
          <div className="my-4 flex items-center justify-center">
            <img
              alt="client_logo"
              src={clientInfo.clientLogo}
              className="h-12"
            />
          </div>
          <div className="flex flex-col items-center px-6 py-4">
            <div>
              <Text weight="bold">{clientInfo.clientName} </Text>
              <Text>would you like to access to your account</Text>
            </div>
            <div className="h-4" />
            <div className="mt-4 flex flex-row justify-center">
              <Button onClick={onClickAllow} loading={authorizeIsLoading}>
                Allow
              </Button>
              <div className="w-12" />
              <Button onClick={onClickDeny} variant="secondary">
                Deny
              </Button>
            </div>
          </div>
        </DepositCard>
      </SidePadding>
      <div className="h-8" />
    </>
  );
};

export default Page;
