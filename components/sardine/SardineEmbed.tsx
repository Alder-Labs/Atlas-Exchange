import { useEffect } from 'react';

import { useSetAtom } from 'jotai';

import { sardineDeviceIdAtom } from '../../lib/jotai';

import { useSardineSdkConfig } from './useSardineSdkConfig';

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
