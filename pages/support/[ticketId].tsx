import 'filepond/dist/filepond.min.css';
import React, { useMemo } from 'react';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import { FilePondFile } from 'filepond';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { FilePond } from 'react-filepond';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';

import {
  Button,
  Title,
  Text,
  TextAreaWithLabel,
  TextLabel,
  Spinner,
} from '../../components/base';
import { SidePadding } from '../../components/layout/SidePadding';
import { Message } from '../../components/support/Message';
import { useSupportMessages } from '../../hooks/useSupportMessages';
import { useFormMutationFetcher } from '../../lib/formMutation';
import { useMutationFetcher } from '../../lib/mutation';
import { toast } from '../../lib/toast';
import {
  CustomPage,
  SupportMessageCreate,
  SupportTicketStatusUpdate,
} from '../../lib/types';

const SupportTicketPage: CustomPage = () => {
  const router = useRouter();
  const { ticketId } = router.query;

  const { handleSubmit, register, reset } = useForm<SupportMessageCreate>();

  const {
    ticket: ticketData,
    messages: messagesData,
    isLoading,
    refetch,
  } = useSupportMessages({ ticketId: ticketId as string });

  // Close Support Ticket
  const { isLoading: closeTicketIsLoading, mutate: closeTicket } = useMutation(
    useMutationFetcher<SupportTicketStatusUpdate, {}>(
      `/proxy/api/support/tickets/${ticketId}/status`
    ),
    {
      onSuccess: () => {
        toast.success('Successfully updated status');
        refetch();
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  // Send support message
  const { isLoading: sendMessageIsLoading, mutate: sendMessage } = useMutation(
    useFormMutationFetcher<SupportMessageCreate, {}>(
      `/proxy/api/support/tickets/${ticketId}/messages`
    ),
    {
      onSuccess: () => {
        toast.success('Successfully added message to ticket.');
        reset();
        refetch();
      },
      onError: (err: Error) => {
        toast.error(`Error: ${err.message}`);
      },
    }
  );

  // Option File Upload for Support Message
  const [supportingDocument, setSupportingDocument] = React.useState<
    FilePondFile[]
  >([]);

  const submitMessage = (data: SupportMessageCreate) => {
    const formData = {
      message: data.message,
      supportFile: supportingDocument.length > 0 && supportingDocument[0].file,
    } as SupportMessageCreate;
    sendMessage(formData);
  };

  const ticketIsOpen = useMemo(() => {
    return ticketData?.status === 'open';
  }, [ticketData]);

  const onCloseTicket = () => {
    closeTicket({ status: 'closed' });
  };

  const onGoBack = () => {
    router.push('/support');
  };

  return (
    <SidePadding>
      <div className="px-8">
        <div className="h-12" />
        <button
          onClick={onGoBack}
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

        <form onSubmit={handleSubmit(submitMessage)}>
          <div className="h-12" />
          <Title>{ticketData && ticketData.title}</Title>
          <div className={'flex w-full flex-row justify-between'}>
            <div className={'flex flex-col'}>
              <Text size={'sm'} color={'secondary'}>
                Ticket #{ticketId}
              </Text>
              <Text size={'sm'} color={'secondary'}>
                {ticketData && ticketData.category}
              </Text>
            </div>
            <Button
              type="button"
              disabled={!ticketIsOpen}
              onClick={onCloseTicket}
              loading={closeTicketIsLoading}
            >
              {ticketIsOpen ? 'Close Ticket' : 'Closed'}
            </Button>
          </div>

          <div className={'h-12'} />

          {isLoading ? (
            <div className={'flex h-12 w-full items-center justify-center'}>
              <Spinner />
            </div>
          ) : null}

          {/* Load messages */}
          {messagesData &&
            messagesData.length > 0 &&
            messagesData.map((message) => (
              <Message
                key={message.id}
                authorIsUser={message.authorIsCustomer}
                {...message}
              />
            ))}

          {/* Loading Spinner when sending message */}
          {sendMessageIsLoading && (
            <div className={clsx('mb-4 flex w-full flex-row justify-end')}>
              <Spinner />
            </div>
          )}
          <div className={'h-12'} />

          <TextAreaWithLabel
            label="Enter a message"
            placeholder={
              ticketIsOpen
                ? 'Reply'
                : 'This ticket has been closed. Please open a new ticket if you ' +
                  'need assistance.'
            }
            disabled={!ticketIsOpen}
            textAreaClassName={'h-24'}
            {...register('message', { required: true })}
          />
          <div className={'h-4'} />

          <TextLabel>Attach Document (optional)</TextLabel>
          <div className="h-2" />
          <div className={'w-124'}>
            <FilePond
              disabled={!ticketIsOpen}
              allowMultiple={false}
              credits={false}
              labelIdle={
                'Drag and Drop here,<span class=text-brand-500> or click to Browse</span>'
              }
              onupdatefiles={setSupportingDocument}
            />
          </div>
          <Button
            className="w-full"
            disabled={!ticketIsOpen}
            type="submit"
            loading={sendMessageIsLoading}
          >
            Send
          </Button>
        </form>
        <div className="h-4" />
      </div>
    </SidePadding>
  );
};

export default SupportTicketPage;
