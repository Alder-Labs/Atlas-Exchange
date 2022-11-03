import React from 'react';

import { FilePondFile, registerPlugin } from 'filepond';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import { useRouter } from 'next/router';
import { FilePond } from 'react-filepond';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import {
  Button,
  Select,
  TextInput,
  Title,
  TextAreaWithLabel,
  TextLabel,
  Text,
} from '../../components/base';
// eslint-disable-next-line import/order
import { SidePadding } from '../../components/layout/SidePadding';

import 'filepond/dist/filepond.min.css';

registerPlugin(FilePondPluginFileValidateSize);

import { useFormMutationFetcher } from '../../lib/formMutation';
import { toast } from '../../lib/toast';
import { CustomPage, SupportTicketCreate } from '../../lib/types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const ticketCategories: { value: string; label: string }[] = [
  { value: 'Account closure', label: 'Account closure' },
  { value: 'Change Address', label: 'Change Address' },
  { value: 'Change Email', label: 'Change Email' },
  { value: 'Crypto Deposit', label: 'Crypto Deposit' },
  { value: 'Crypto Withdrawal', label: 'Crypto Withdrawal' },
  { value: 'Fiat Deposit', label: 'Fiat Deposit' },
  { value: 'Fiat Withdrawal', label: 'Fiat Withdrawal' },
  { value: 'General Feedback', label: 'General Feedback' },
  { value: 'Identity Verification', label: 'Identity Verification' },
  { value: 'Other', label: 'Other' },
  { value: 'Technical issue', label: 'Technical issue' },
  { value: 'Trading issue', label: 'Trading issue' },
  { value: 'Trading question', label: 'Trading question' },
  { value: 'Urgent account security', label: 'Urgent account security' },
  { value: 'Video Upload', label: 'Video Upload' },
];

const NewTicketPage: CustomPage = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SupportTicketCreate>();

  const [supportingDocument, setSupportingDocument] = React.useState<
    FilePondFile[]
  >([]);

  const { isLoading: submitIsLoading, mutate: submitTicket } = useMutation(
    useFormMutationFetcher<SupportTicketCreate, {}>(
      `/proxy/api/support/tickets`
    ),
    {
      onSuccess: () => {
        toast.success('Successfully created support ticket');
        router.push('/support');
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  const submitNewTicket = (data: Omit<SupportTicketCreate, 'document'>) => {
    const formData = {
      ...data,
      supportFile: supportingDocument.length > 0 && supportingDocument[0].file,
    } as SupportTicketCreate;
    submitTicket(formData);
  };

  return (
    <SidePadding>
      <div className="pt-8 sm:px-8 sm:pt-10">
        <button
          onClick={() => router.back()}
          className={`mr-2 flex flex-row items-center `}
        >
          <Text
            size="lg"
            color="secondary"
            hoverColor={'normal'}
            className="flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            Back
          </Text>
        </button>
      </div>
      <div className="lg:mx-48">
        <form onSubmit={handleSubmit(submitNewTicket)}>
          <div className="h-12" />
          <Title>New Ticket</Title>
          <div className="h-4" />
          <TextLabel>Category *</TextLabel>
          <div className={'h-2'} />
          <Controller
            name={'category'}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select
                value={field.value}
                placeholder="Select Category"
                onSelect={(value) => field.onChange(value)}
                options={ticketCategories}
                className="w-full"
              />
            )}
          />
          <div className="h-4" />
          <TextInput
            className={'w-full'}
            label={'Title *'}
            placeholder="Title"
            {...register('title', { required: true })}
          />
          <div className="h-4" />
          <TextAreaWithLabel
            className={'w-full'}
            label="Message *"
            placeholder="Enter message here"
            textAreaClassName="h-36"
            {...register('message', { required: true })}
          />
          <div className="h-4" />
          <TextLabel>Document (optional)</TextLabel>
          <div className="h-2" />
          <div className={'w-64'}>
            <FilePond
              allowMultiple={false}
              credits={false}
              labelIdle={
                'Drag and drop here,<p class=text-brand-500> or click to Browse</p>'
              }
              onupdatefiles={setSupportingDocument}
              allowFileSizeValidation={true}
              maxFileSize="5MB"
            />
          </div>
          <div className="h-4" />
          <Button type="submit" loading={submitIsLoading}>
            Submit
          </Button>
        </form>
      </div>
      <div className="h-24" />
    </SidePadding>
  );
};

export default NewTicketPage;
