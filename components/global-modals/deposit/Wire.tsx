import React, { forwardRef, useState } from 'react';

import {
  faCircleInfo,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';

import { useModalState } from '../../../hooks/useModalState';
import { useWireInstructions } from '../../../hooks/useWireInstructions';
import { BRAND_NAME } from '../../../lib/constants';
import { useMutationFetcher } from '../../../lib/mutation';
import { toast } from '../../../lib/toast';
import { WireRegister, WireRegisterResponse } from '../../../lib/types';
import { ModalState } from '../../../lib/types/modalState';
import {
  Text,
  TextInput,
  InputCheckbox,
  Select,
  Spinner,
  Button,
} from '../../base';
import { Warning } from '../../Warning';

type DepositWireProps = React.HTMLAttributes<HTMLDivElement>;

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD (USD)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'CHF', label: 'Swiss Franc (CHF)' },
  { value: 'GBP', label: 'Pound (GBP)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'HKD', label: 'Hong Kong Dollar (HKD)' },
];

const TITLE_STLYE = 'mt-4 mb-2 border-b-1 border-grayLight-80';
const ENTRY_STYLE =
  'flex flex-row justify-between py-4 border-b-1 border-grayLight-80';

const DepositWireEntry = (props: {
  left: React.ReactNode;
  right: React.ReactNode;
}) => {
  const { left, right } = props;
  return (
    <div className={ENTRY_STYLE}>
      <div>
        <Text color="secondary">{left}</Text>
      </div>
      <div className="flex flex-row">
        <Text className="text-right">{right}</Text>
      </div>
    </div>
  );
};

export const DepositWireConfirm = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <Text size="2xl">Your deposit has been registered!</Text>
      <div className="h-4" />
      <Text color="secondary">
        Please remember to log into your bank account and initiate your wire
        transfer. Please also ensure the deposit registered on {BRAND_NAME} and
        wire transfer initiated from your bank are the same. This is to ensure
        you can get credited promptly
      </Text>
      <div className="h-6" />
      <Button
        className="w-full"
        onClick={() => {
          router.push('/wallet');
        }}
      >
        <div className="w-full">Continue to Wallet</div>
      </Button>
    </div>
  );
};

const DepositWireInstruction = (props: {
  currency: string;
  amount: string;
}) => {
  const { currency, amount } = props;
  const [modalState, setModalState, handlers] = useModalState();

  const [showShortMemo, setShowShortMemo] = useState(false);
  const [includedAccountId, setIncludedAccountId] = useState(false);
  const {
    data: wireInst,
    error: wireInstructionsError,
    isLoading: wireInstructionsLoading,
  } = useWireInstructions(currency, {
    onError: (err: Error) => {
      toast.error(error.message);
    },
    refetchOnWindowFocus: false,
  });

  const { mutate: registerWire, isLoading: registerWireIsLoading } =
    useMutation(
      useMutationFetcher<WireRegister, WireRegisterResponse>(
        `/proxy/api/wallet/fiat_deposits`
      ),
      {
        onSuccess: (_: WireRegisterResponse) => {
          setModalState({ state: ModalState.DepositWireConfirm });
        },
        onError: (err: Error) => {
          toast.error(`Error: ${err.message}`);
        },
      }
    );

  const isLoading = wireInstructionsLoading;
  const error = wireInstructionsError;

  const registerWireTransfer = () => {
    if (!includedAccountId) {
      toast.error(
        'Please confirm you have included Account Identifier in your wire transfer'
      );
      return;
    }
    const data = {
      currency: currency,
      size: Number(amount),
      notes: '',
    };
    registerWire(data);
  };

  return (
    <div className="flex w-full flex-col">
      {isLoading && (
        <div className="my-12 flex flex-row justify-center">
          <Spinner />
        </div>
      )}
      {!isLoading && wireInst && (
        <div>
          <DepositWireEntry
            key="Deposit amount"
            left="Deposit amount"
            right={`${amount} ${currency}`}
          />
          <h2 className={TITLE_STLYE}>
            <Text size="xl" weight="bold">
              Beneficiary Account
            </Text>
          </h2>
          {wireInst.instructions.beneficiary.map(({ name, value }) => (
            <DepositWireEntry key={name} left={name} right={value} />
          ))}
          {wireInst.instructions.receiving &&
            wireInst.instructions.receiving.length > 0 && (
              <div>
                <h2 className={TITLE_STLYE}>
                  <Text size="xl" weight="bold">
                    Receiving Bank
                  </Text>
                </h2>
                <div className="rounded-xl">
                  {wireInst.instructions.receiving.map(({ name, value }) => (
                    <DepositWireEntry key={name} left={name} right={value} />
                  ))}
                </div>
              </div>
            )}
          <h2 className={TITLE_STLYE}>
            <Text size="xl" weight="bold">
              Account Identifier
            </Text>
          </h2>
          <div className="rounded-xl">
            {wireInst.memo && !showShortMemo && (
              <DepositWireEntry
                key="Account Identifier"
                left="Account Identifier"
                right={wireInst.memo}
              />
            )}
            {wireInst.shortMemo && showShortMemo && (
              <DepositWireEntry
                key="Account Identifier (shorten version)"
                left={
                  <div className="flex flex-col">
                    <div>Account Identifier</div>
                    <div>(shorten version)</div>
                  </div>
                }
                right={wireInst.shortMemo}
              />
            )}
            {wireInst.shortMemo && (
              <div
                className="cursor-pointer text-textAccent"
                onClick={() => setShowShortMemo(!showShortMemo)}
              >
                (Click here if shorter memo is needed)
              </div>
            )}
            <div className="h-2" />
            <Warning>
              <Text color="warning">
                <div className="flex flex-row items-center">
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    className="mr-2.5 h-6"
                  />{' '}
                  Account Identifier MUST be included in wire Memo or Reference
                  field
                </div>
              </Text>
            </Warning>
          </div>
          <InputCheckbox
            checked={includedAccountId}
            onClick={() => setIncludedAccountId(!includedAccountId)}
            label="I have included my Account Identifier in my wire transfer and confirm that the name on my bank account matches the name on my account."
          ></InputCheckbox>
          <div className="mt-6 w-full">
            <Button
              className="w-full"
              loading={registerWireIsLoading}
              onClick={registerWireTransfer}
            >
              <div className="w-full">Register Wire Transfer</div>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const DepositWire = forwardRef<HTMLDivElement, DepositWireProps>(
  (props, ref) => {
    const [currency, setCurrency] = useState('USD');

    const [amount, setAmount] = useState('');
    const [confirmAmount, setConfirmAmount] = useState(false);

    const regexp = new RegExp('^\\d+(.\\d\\d)?$');

    function onChangeSetAmount(value: string) {
      setAmount(value);
    }

    function onConfirmAmount() {
      const amountTrimmed = amount.trim();
      if (!regexp.test(amountTrimmed)) {
        toast.error('Amount is invalid');
        return;
      }
      setConfirmAmount(true);
    }

    if (!confirmAmount) {
      return (
        <div className="flex flex-col">
          <Text>Please enter the amount you would like to wire</Text>
          <div className="mt-4 flex flex-row">
            <Select
              className="w-48"
              value={currency}
              onSelect={(e) => {
                if (typeof e === 'string') {
                  setCurrency(e);
                }
              }}
              options={CURRENCY_OPTIONS}
            />
            <TextInput
              className="ml-4 w-48 sm:w-56"
              value={amount}
              type="number"
              min="0"
              placeholder="1234.00"
              onChange={(e) => onChangeSetAmount(e.target.value)}
            ></TextInput>
          </div>
          <div className="h-6" />
          <Warning>
            <Text color="warning">
              <div className="flex flex-row items-center">
                <div>
                  <FontAwesomeIcon icon={faCircleInfo} className="mr-4 h-5" />
                </div>
                <div>
                  The holder of the account transferring funds must match the
                  KYC name registered. Wires sent from a different name will
                  result in a return with a flat fee of 75 USD for the return
                  and a processing delay of up to two weeks.
                </div>
              </div>
            </Text>
          </Warning>
          <Button className="mt-4 w-full" onClick={onConfirmAmount}>
            <div className="w-full">Deposit via Wire Transfer</div>
          </Button>
        </div>
      );
    }

    return (
      <div className="w-full">
        <DepositWireInstruction currency={currency} amount={amount} />
      </div>
    );
  }
);

DepositWire.displayName = 'DepositWire';

export default DepositWire;
