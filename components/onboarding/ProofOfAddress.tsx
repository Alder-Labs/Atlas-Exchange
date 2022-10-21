import { useState } from 'react';

import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FilePondFile, registerPlugin } from 'filepond';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import { FilePond } from 'react-filepond';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import { useFormMutationFetcher } from '../../lib/formMutation';
import { ALPHA3_TO_COUNTRY_NAME } from '../../lib/country-codes';
import { toast } from '../../lib/toast';
import { Text, Button, TextLabel } from '../base';
import { TextBubble } from '../Warning';

import { OnboardingCard, OnboardingCardProps } from './OnboardingCard';

import 'filepond/dist/filepond.min.css';

registerPlugin(FilePondPluginFileValidateSize);

interface ProofOfAddressProps
  extends Omit<OnboardingCardProps, 'children' | 'title'> {
  onContinue: () => void;
}

type ProofOfAddressForm = {
  kycType: string;
  country: string;
  fullLegalName: string;
  proofOfAddress: File;
};

export function ProofOfAddress(props: ProofOfAddressProps) {
  const { onContinue, ...rest } = props;

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<ProofOfAddressForm>();

  const [supportingDocument, setSupportingDocument] = useState<FilePondFile[]>(
    []
  );

  const cachedForm = JSON.parse(localStorage.getItem('kycForm') || '{}');

  const onSubmit = (data: ProofOfAddressForm) => {
    const formData = {
      kycType: 'individual',
      country: cachedForm.country,
      fullLegalName: cachedForm.fullLegalName,
      proofOfAddress:
        supportingDocument.length > 0 && supportingDocument[0].file,
    } as ProofOfAddressForm;
    proofOfAddressUpload(formData);
  };

  const {
    isLoading: proofOfAddressUploadIsLoading,
    mutate: proofOfAddressUpload,
  } = useMutation(
    useFormMutationFetcher<ProofOfAddressForm, {}>(`/proxy/api/kyc/level_2`),
    {
      onSuccess: (data) => {
        toast.success('Successfully submitted proof of address');
        setTimeout(() => {
          onContinue();
        }, 500);
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  return (
    <OnboardingCard {...rest} title={'Proof of Address'}>
      <div className="h-6"></div>
      <TextBubble className="bg-info/25 dark:bg-infoDark/25">
        <div className="flex flex-row items-center">
          <Text color="info">
            <FontAwesomeIcon icon={faCircleInfo} className="mr-4 h-5" />
          </Text>
          <Text>
            Country of residence and phone number country code are different.
            Please provide a proof of address document(s) to continue and
            complete Indentity Verification Level 2.
          </Text>
        </div>
      </TextBubble>
      <div className="h-2" />

      <div className="flex flex-row justify-between">
        <Text color="secondary">
          Country:{' '}
          <Text>
            {ALPHA3_TO_COUNTRY_NAME[cachedForm.country] ?? ''} (
            {cachedForm.country})
          </Text >
        </Text >
      </div >
      <div className="flex flex-row justify-between">
        <Text color="secondary">
          Legal Name: <Text>{cachedForm.fullLegalName}</Text>
        </Text>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="h-1"></div>
        <TextLabel>Proof of Address document(s)</TextLabel>
        <div className="h-4" />
        <div className={'w-full'}>
          <FilePond
            className="cursor-pointer"
            allowMultiple={true}
            credits={false}
            labelIdle={
              'Drag and drop here,<p class=text-brand-500> or click to Browse</p>'
            }
            onupdatefiles={setSupportingDocument}
            allowFileSizeValidation={true}
            maxFiles={4}
            maxFileSize="2MB"
          />
        </div>
        <div className="h-4" />
        <Button
          loading={proofOfAddressUploadIsLoading}
          disabled={supportingDocument.length === 0}
          className="w-full"
          type="submit"
        >
          Continue to Identity Verification Level 2
        </Button>
      </form>
    </OnboardingCard >
  );
}
