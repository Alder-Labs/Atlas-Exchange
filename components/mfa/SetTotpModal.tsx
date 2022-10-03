import React, { useEffect, useState } from 'react';

import { faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import QRCode from 'react-qr-code';
import { useMutation } from 'react-query';

import { useLoginStatus } from '../../hooks/useLoginStatus';
import { useModal } from '../../hooks/useModal';
import { useUserState } from '../../lib/auth-token-context';
import { WEBSITE_URL } from '../../lib/constants';
import { useDarkOrLightMode } from '../../lib/dark-mode';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { Text, Button, TextInput, Spinner } from '../base';
import { TitledModal } from '../modals/TitledModal';

import { ExistingMfaInput } from './ExistingMfaInput';
import { MfaType } from '../../lib/types';

const TOTP_ISSUER = encodeURIComponent(WEBSITE_URL);

interface SetTotpMfaRequest {
  code: string;
  existingCode: string;
  seed: string;
}

interface SetTotpModal {}
export function SetTotpModal(props: { mfa: MfaType }) {
  const router = useRouter();
  const darkMode = useDarkOrLightMode();
  const userState = useUserState();
  const { refetch: refetchLoginStatus, data: loginData } = useLoginStatus();
  const [open, handlers] = useModal(false);
  const [otpCode, setOtpCode] = useState('');
  const [existingMfaCode, setExistingMfaCode] = useState('');
  // Get TOTP URL
  const { data: totpSeed, mutate: getTotpSeed } = useMutation(
    useMutationFetcher<void, string>('/proxy/api/mfa/generate_totp_seed')
  );
  useEffect(() => {
    if (open) {
      getTotpSeed();
    }
  }, [getTotpSeed, open]);

  const otpUrl =
    totpSeed && loginData?.user?.email
      ? `otpauth://totp/${loginData?.user?.email}?secret=${totpSeed}&issuer=${TOTP_ISSUER}`
      : null;

  // Set TOTP as mfa method
  const { mutate: setTotpMfa, isLoading: loadingSetTotpMfa } = useMutation(
    useMutationFetcher<SetTotpMfaRequest, { token: string }>(
      '/api/mfa/set_totp_mfa',
      {
        onFetchSuccess: (res) =>
          new Promise((resolve, reject) => {
            if (userState.user) {
              userState.setAuthToken(res.token, async (token) => {
                if (token) {
                  await refetchLoginStatus();
                  resolve(res);
                } else {
                  reject();
                }
              });
            } else {
              reject();
            }
          }),
      }
    ),
    {
      onSuccess: (res) => {
        toast.success('TOTP successfully enabled');
        handlers.close();
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  const handleEnableTotp = async () => {
    if (!totpSeed) {
      toast.error('No TOTP seed');
      return;
    }

    setTotpMfa({
      code: otpCode,
      seed: totpSeed,
      existingCode: existingMfaCode,
    });
  };

  const btnText = (mfa: MfaType) => {
    switch (mfa) {
      case 'totp':
        return 'Authenticator App (Enabled)';
      case null:
        return 'Enable Authenticator App 2FA';
      default:
        return 'Switch to Authenticator App';
    }
  };

  const btnDisabled = props.mfa === 'totp';
  const btnStyle = clsx({
    ['flex justify-start items-center px-8 py-3.5 rounded-full duration-300']:
      true,
    ['hover:bg-black/25 hover:dark:bg-white/25']: !btnDisabled,
    ['bg-greenLight/50 dark:bg-greenDark/50']: btnDisabled,
  });

  return (
    <>
      <button
        className={btnStyle}
        onClick={handlers.open}
        disabled={btnDisabled}
      >
        <FontAwesomeIcon icon={faLock} className="w-4" />
        <div className="w-4" />
        <Text>{btnText(props.mfa)}</Text>
      </button>

      <TitledModal
        isOpen={open}
        title={'Change to Authenticator App MFA'}
        onClose={handlers.close}
      >
        <div>
          <div className="flex flex-col items-center p-6">
            <div
              style={{ width: 158, height: 158, padding: 4 }}
              className="flex items-center justify-center bg-white"
            >
              {otpUrl ? <QRCode value={otpUrl} size={150} /> : <Spinner />}
            </div>
            <div className="h-4"></div>
            <Text color="secondary" className="w-full pl-4">
              <ol type="1" className="list-decimal">
                <li>
                  <Text color="secondary">
                    Install an authenticator app on your mobile device if you{' '}
                    {"don't"} already have one.
                  </Text>
                </li>
                <div className="h-1"></div>
                <li>
                  <Text color="secondary">
                    Scan QR code with the authenticator (or tap it in mobile
                    browser).
                  </Text>
                </li>
              </ol>
            </Text>
          </div>
          <div className="dark:bg-LIGMA_BALLS-40 h-px w-full"></div>
          <div className="p-6">
            <div className="flex justify-between gap-8">
              <Text>
                Enter the 2-step verification code from your authenticator app
              </Text>
              <TextInput
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value);
                }}
                placeholder="123456"
              />
            </div>
          </div>
          <div className="h-6"></div>
          <div className="flex justify-between gap-8 px-6">
            <ExistingMfaInput
              label="Existing MFA Code (you have SMS MFA enabled and code is required for this action)"
              placeholder="Existing MFA Code"
              value={existingMfaCode}
              onChange={setExistingMfaCode}
            />
          </div>
          <div className="h-6"></div>
          <div className="dark:bg-LIGMA_BALLS-40 h-px w-full"></div>
          <div className="flex items-center gap-4 p-8">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handlers.close}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleEnableTotp}
              loading={loadingSetTotpMfa}
            >
              Enable
            </Button>
          </div>
        </div>
      </TitledModal>
    </>
  );
}
