import React from 'react';

import { FilePondFile, registerPlugin } from 'filepond';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import { NextPage } from 'next';
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
} from '../../components/base';
// eslint-disable-next-line import/order
import { SidePadding } from '../../components/layout/SidePadding';

import 'filepond/dist/filepond.min.css';

registerPlugin(FilePondPluginFileValidateSize);

import { useFormMutationFetcher } from '../../lib/formMutation';
import { toast } from '../../lib/toast';
import { SupportTicketCreate } from '../../lib/types';

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

const NewTicketPage: NextPage = () => {
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

  const submitNewTicket = (data: SupportTicketCreate) => {
    console.log('test');
    const formData = {
      ...data,
      document: supportingDocument.length > 0 && supportingDocument[0].file,
    } as SupportTicketCreate;
    submitTicket(formData);
  };

  return (
    <SidePadding>
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
    </SidePadding>
  );
};

export default NewTicketPage;
