import React, { useEffect, useMemo, useState } from 'react';

import { useQuery } from 'react-query';

import { useUserState } from '../../lib/auth-token-context';
import { useFetcher } from '../../lib/fetcher';
import { SardineSdkConfig } from '../../lib/types/sardine';
import { sardineDeviceIdAtom } from '../../lib/jotai';
import { useSetAtom } from 'jotai';

const useSardineSdkConfig = () => {
  const userState = useUserState();
  const isSignedIn = !!userState?.user?.token;

  const { data, error, isLoading, refetch } = useQuery(
    `/api/sardine/sdk-config`,
    useFetcher<SardineSdkConfig>(),
    { enabled: isSignedIn, refetchOnWindowFocus: false }
  );
  return useMemo(() => {
    return {
      data,
      error,
      refetch,
      isLoading,
    };
  }, [data, error, refetch, isLoading]);
};

const SardineEmbed = () => {
  const { data, error } = useSardineSdkConfig();
  const setSardineDeviceId = useSetAtom(sardineDeviceIdAtom);
  useEffect(() => {
    async function loadSardine() {
      if (!data || error) return;

      const loader = document.createElement('script');
      loader.type = 'text/javascript';
      loader.async = true;
      loader.src = data.sardineUrl;

      var SARDINE_CONTEXT: any;
      loader.onload = function () {
        SARDINE_CONTEXT = (window as any)._Sardine.createContext({
          clientId: data.context.clientId,
          sessionKey: data.context.sessionKey,
          userIdHash: data.context.userIdHash,
          flow: data.context.flow,
          environment: process.env.NODE_ENV === 'production',
          parentElement: document.body,
          // called when sardine generates/restores deviceID for given device.
          onDeviceResponse: function (data: any) {
            setSardineDeviceId(data.deviceId);
          },
        });
      };
      const s = document.getElementsByTagName('script')[0];
      s.parentNode?.insertBefore(loader, s);
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    loadSardine();
  }, [data, error, setSardineDeviceId]);
  return null;
};

export default SardineEmbed;
