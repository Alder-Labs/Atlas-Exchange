import React from 'react';

import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';

import { useFetcher } from '../../lib/fetcher';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import { TextInput } from '../base';

interface FtxPublicKey {
  keyId: string;
  publicKey: string;
}

interface CreateCard {
  encryptedData: string;
  keyId: string;
  name: string;
  expiryMonth: Number;
  expiryYear: string;
  billingInfo: {
    name: string;
    line1: string;
    line2: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

interface CreateCardInputs {
  number: Number;
  cvc: Number;
  name: string;
  expiryMonth: Number;
  expiryYear: string;
  billingInfo: {
    name: string;
    line1: string;
    line2: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

async function encryptCardDetails(
  publicKey: FtxPublicKey,
  cardDetails: { number: string; cvv: string }
): Promise<string> {
  const base64str = window.atob(publicKey.publicKey);

  const openpgp = await import('openpgp');
  const decodedPublicKeyPromise = openpgp.readKey({ armoredKey: base64str });
  const messagePromise = openpgp.createMessage({
    text: JSON.stringify(cardDetails),
  });

  const decodedPublicKey = await decodedPublicKeyPromise;
  const message = await messagePromise;

  const cipherText = await openpgp.encrypt({
    message,
    encryptionKeys: decodedPublicKey,
  });
  const encryptedMessage = window.btoa(cipherText.toString());

  return encryptedMessage;
}

export const AddCard = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateCardInputs>();

  const {
    data: publicKey,
    error: publicKeyError,
    isLoading,
    refetch,
  } = useQuery('/proxy/api/cards/public_key', useFetcher<FtxPublicKey>());

  const { isLoading: addCardLoading, mutate: addCard } = useMutation(
    useMutationFetcher<CreateCard, {}>(`/proxy/api/cards`),
    {
      onSuccess: (data) => {
        toast.success('Successfully added card');
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  const onSubmit: SubmitHandler<CreateCardInputs> = async (formData) => {
    console.log('input data', formData);
    if (!publicKey) {
      toast.error('Server Error: Failed to fetch public key');
      return;
    }

    const cardDetails = {
      number: formData.number.toString(),
      cvv: formData.cvc.toString(),
    };
    const encryptedData = await encryptCardDetails(publicKey, cardDetails);

    const data = {
      encryptedData,
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
      name: formData.name,
      keyId: publicKey?.keyId,
      billingInfo: formData.billingInfo,
    };
    addCard(data);
  };

  return (
    <div className="text-textPrimary bg-grayLight-90 flex-col flex-wrap rounded-2xl p-6">
      <h2 className="text-2xl font-bold">Add a new card</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          label="Card name"
          placeholder="Chase credit card"
          {...register('name', { required: 'Please give a name for the card' })}
        ></TextInput>

        <div className="mt-4"></div>
        <TextInput
          label="Cardholder Name"
          placeholder="John Smith"
          {...register('billingInfo.name', {
            required: 'Please provide the name of the card holder',
          })}
        ></TextInput>
        <TextInput
          label="Card number"
          type="number"
          placeholder="1234 1234 1234 1234"
          {...register('number', {
            required: 'Please provide the number on the card',
          })}
        ></TextInput>
        <TextInput
          label="Expiry month"
          type="number"
          placeholder="12"
          {...register('expiryMonth', { required: 'Expiry month missing' })}
        ></TextInput>
        <TextInput
          label="Expiry year"
          type="number"
          placeholder="2022"
          {...register('expiryYear', { required: 'Expiry year missing' })}
        ></TextInput>
        <TextInput
          label="CVC"
          type="number"
          placeholder="123"
          {...register('cvc', { required: 'CVC missing' })}
        ></TextInput>

        <div className="mt-4"></div>
        <TextInput
          label="Street address (line 1)"
          placeholder="6354 Boardfish road"
          {...register('billingInfo.line1', { required: 'Address missing' })}
        ></TextInput>
        <TextInput
          label="Street address (line 2)"
          {...register('billingInfo.line2')}
        ></TextInput>
        <TextInput
          label="City"
          {...register('billingInfo.city', { required: 'City missing' })}
        ></TextInput>
        <TextInput
          label="Postal code"
          {...register('billingInfo.postalCode', {
            required: 'Postal code missing',
          })}
        ></TextInput>
        <TextInput
          label="Country"
          defaultValue="US"
          {...register('billingInfo.country', { required: 'Country missing' })}
        ></TextInput>

        <TextInput label="Add Card" type="submit" value="Add Card" />
      </form>
    </div>
  );
};

export default AddCard;
