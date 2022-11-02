import React, { useState } from 'react';

import { faBan, faCircleInfo, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import QRCode from 'react-qr-code';

import { useDepositAddress } from '../../../hooks/transfer/useDepositAddress';
import { toast } from '../../../lib/toast';
import { Coin } from '../../../lib/types';
import { AddressText } from '../../AddressText';
import { Text } from '../../base';
import { Button, Select, Spinner } from '../../base';
import { CryptoIcon } from '../../CryptoIcon';
import { LoaderSingleLine } from '../../loaders';
import { Warning } from '../../Warning';
import { useModalState } from '../../../hooks/modal';
import { ModalState } from '../../../lib/types/modalState';

function GrayQRCodeContainer(props: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-grayLight-30 p-6 shadow-xl dark:bg-grayDark-50">
      {props.children}
    </div>
  );
}

export const CryptoDepositAddress = (props: { coin: Coin }) => {
  const { coin } = props;
  const router = useRouter();
  const [modalState, setModalState, handlers] = useModalState();

  const [depositMethod, setDepositMethod] = useState<string | null>(
    coin.methods[0] ?? null
  );
  const { data, error, isLoading } = useDepositAddress(
    {
      coinId: coin.id,
      method: depositMethod ?? '',
    },
    {
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
      refetchOnWindowFocus: false,
      retry: false,
    }
  );

  function onChangeDepositMethod(method: string | null) {
    if (method !== null && method !== depositMethod) {
      setDepositMethod(method);
    }
  }

  function copyAddressToClipboard() {
    if (data) {
      navigator.clipboard.writeText(data.address);
      toast.success(`Copied address to clipboard`);
    }
  }

  return (
    <div className="flex w-full flex-col duration-300 ease-in">
      <div className="mr-6 ml-2 flex flex-col items-center">
        <div className="flex flex-row items-center">
          <CryptoIcon coinId={coin.id} className="mr-3 h-10" />
          <Text size="4xl">{coin.id}</Text>
        </div>
        <div className="h-4" />
        <div className="rounded-2xl bg-grayLight-30 dark:bg-grayDark-40">
          <Select
            value={depositMethod}
            onSelect={onChangeDepositMethod}
            options={coin.methods.map((method) => ({
              label: `${method.toUpperCase()} address`,
              value: method,
            }))}
          ></Select>
        </div>
        <div className="h-4"></div>
      </div>
      <div
        className="flex
          flex-col justify-center rounded-xl
          border border-grayLight-50 dark:border-grayDark-50"
      >
        <div className="mb-6 flex flex-row justify-center pt-8">
          {isLoading && (
            <GrayQRCodeContainer>
              <div className="flex h-48 w-48 items-center justify-center">
                <Spinner />
              </div>
            </GrayQRCodeContainer>
          )}
          {!isLoading && error && (
            <GrayQRCodeContainer>
              <div className="flex h-48 w-48 flex-col items-center justify-center">
                <FontAwesomeIcon className="h-12" icon={faBan} />
                <div className="h-6" />
                <Text className="text-center" weight="semibold">
                  {error.message}
                </Text>
              </div>
            </GrayQRCodeContainer>
          )}
          {!isLoading && data && (
            <div className="rounded-3xl bg-white p-6 shadow-xl">
              <QRCode size={192} value={data.address} />
            </div>
          )}
        </div>
        <div className="h-px bg-grayLight-50 dark:bg-grayDark-50" />
        <div className="justify-left mb-4 flex w-full flex-row items-center justify-center px-4 pt-4">
          {(isLoading || !data) && (
            <div className="mr-4 w-4/5">
              <LoaderSingleLine />
            </div>
          )}
          {data && <AddressText className="m-2">{data.address}</AddressText>}
          <button
            className="ml-2 cursor-pointer text-grayLight-90/75 duration-300 hover:text-grayLight-90 dark:text-grayDark-90/75 hover:dark:text-grayDark-90"
            onClick={copyAddressToClipboard}
          >
            <FontAwesomeIcon className="h-6" icon={faCopy} />
          </button>
        </div>
      </div>
      <div className="h-4" />
      <Warning>
        <Text color="warning">
          <div className="flex flex-row items-center">
            <div>
              <FontAwesomeIcon icon={faCircleInfo} className="mr-4 h-5" />
            </div>
            <div>
              Only send ({coin.id}) to this address. Sending other coins will
              result in loss.
            </div>
          </div>
        </Text>
      </Warning>
      <div className="h-4" />
      <Button
        className="w-full"
        onClick={async () => {
          await router.push('/wallet');
          setModalState({ state: ModalState.Closed });
        }}
      >
        <div className="w-full">Continue to Wallet</div>
      </Button>
    </div>
  );
};

export default CryptoDepositAddress;
