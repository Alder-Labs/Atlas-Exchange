import React from 'react';

import { useRouter } from 'next/router';

import { Button, Text, TextButton, Title } from '../../components/base';
import { SidePadding } from '../../components/layout/SidePadding';
import { LoaderDoubleLine } from '../../components/loaders';
import { Table } from '../../components/table';
import { StatusBadge } from '../../components/wallet/StatusBadge';
import { useModalState } from '../../hooks/modal';
import { useSupportTickets } from '../../hooks/support';
import { useUserState } from '../../lib/auth-token-context';
import { CustomPage } from '../../lib/types';
import { ModalState } from '../../lib/types/modalState';
import { UserStateStatus } from '../../lib/types/user-states';

const Index: CustomPage = () => {
  const userState = useUserState();
  const isSignedOut = userState.status === UserStateStatus.SIGNED_OUT;
  return (
    <SidePadding className={'grow'}>
      {isSignedOut ? PublicSupport() : SignedInSupport()}
      {/*<div className={'flex w-full items-center justify-center'}>sss</div>*/}
    </SidePadding>
  );
};

export function SignedInSupport() {
  const router = useRouter();
  const {
    data: supportTickets,
    error: supportTicketsError,
    refetch: refetchSupportTickets,
    isLoading: supportTicketsIsLoading,
  } = useSupportTickets();

  return (
    <div className="flex w-full flex-col sm:px-8">
      <div className="h-12" />
      <div className="mb-8 rounded-3xl border border-grayLight-60 p-6 dark:border-grayDark-60 sm:w-1/2">
        <Title className="text-3xl">Support Ticket</Title>
        <div className="h-4" />
        <Text>
          File a support ticket if you find bugs, have account specific problems
          or issues with transferring fund
        </Text>
        <div className="h-6" />
        <Button
          size="md"
          onClick={() => {
            router.push('/support/new');
          }}
        >
          Create a new ticket
        </Button>
      </div>
      {/*<div className={'flex '}></div>*/}
      <div className={'flex-1 py-8 sm:p-8'}>
        <Table
          tableClassName="table-fixed"
          data={supportTickets ?? []}
          loading={supportTicketsIsLoading}
          loadingRows={3}
          onRowClick={(ticket) => {
            router.push({
              pathname: `/support/[ticketId]`,
              query: {
                ticketId: ticket.id,
                title: ticket.title,
                category: ticket.category,
                status: ticket.status,
              },
            });
          }}
          renderEmpty={() => {
            return (
              <div className="flex w-full flex-col items-center justify-center">
                <div className="mt-16 mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-brand-400/25">
                  <div className="text-5xl font-bold text-brand-400">S</div>
                </div>
                <Text size="2xl">No Support Tickets</Text>
                <div className="w-72 text-center">
                  <Text color="secondary">
                    Open a new support ticket with the create a new ticket
                    button above{' '}
                  </Text>
                </div>
              </div>
            );
          }}
          columns={[
            {
              type: 'custom',
              label: 'Submitted',
              // show: 'md',
              widthClassName: 'w-20 sm:w-20 lg:w-28',
              renderLoading: () => <LoaderDoubleLine />,
              renderCell: (ticket) => {
                const date = new Date(ticket.time);
                const year = date.getFullYear();
                const month = date.getMonth();
                const day = date.getDay();

                const hour = date.getHours();
                const minute = date.getMinutes();
                const ampm = hour > 12 ? 'PM' : 'AM';
                return (
                  <div className="flex flex-col">
                    <Text>{`${month}/${day}/${year}`}</Text>
                    <Text color="secondary">{`${hour}:${minute
                      .toString()
                      .padStart(2, '0')} ${ampm}`}</Text>
                  </div>
                );
              },
            },
            {
              type: 'string',
              label: 'Category',
              show: 'md',
              getCellValue: (ticket) => `${ticket.category}`,
              align: 'left',
            },
            {
              type: 'string',
              label: 'Title',
              getCellValue: (ticket) => `${ticket.title}`,
              align: 'left',
            },
            {
              type: 'custom',
              label: 'Status',
              widthClassName: 'w-20 sm:w-20 lg:w-28',
              renderCell: (ticket) => {
                return (
                  <div className="flex">
                    <StatusBadge status={ticket.status} />
                  </div>
                );
              },
              align: 'left',
            },
            {
              type: 'custom',
              align: 'left',
              label: '',
              show: 'md',
              widthClassName: 'w-20 sm:w-20 lg:w-28',
              renderCell: (ticket) => {
                return (
                  <div className={'flex w-full justify-end pr-4'}>
                    <TextButton
                      onClick={() => {
                        console.log('ticketId', ticket.id);
                        router.push({
                          pathname: `/support/[ticketId]`,
                          query: {
                            ticketId: ticket.id,
                            title: ticket.title,
                            category: ticket.category,
                            status: ticket.status,
                          },
                        });
                      }}
                    >
                      View Ticket
                    </TextButton>
                  </div>
                );
              },
            },
          ]}
        ></Table>
      </div>
    </div>
  );
}

export function PublicSupport() {
  const [modalStateDetailed, setModalStateDetailed] = useModalState();

  return (
    <>
      <div className="h-12" />
      <div className="mb-8 rounded-3xl border border-grayLight-60 p-6 dark:border-grayDark-60 sm:w-1/2">
        <Title className="text-3xl">Sign in</Title>
        <div className="h-4" />
        <Text color="secondary">
          Sign in to your account to view and create support tickets.
        </Text>
        <div className="h-6" />
        <Button
          size="md"
          onClick={() => setModalStateDetailed({ state: ModalState.SignIn })}
        >
          Sign in
        </Button>
      </div>

      <div className="mb-8 rounded-3xl border border-grayLight-60 p-6 dark:border-grayDark-60 sm:w-1/2">
        <Title className="text-3xl">Request a Support-Only Link</Title>
        <div className="h-4" />
        <Text color="secondary">
          Can&apos;t sign in? A support-only link will be sent to your email
          that logs you into your account, but only to read and send support
          messages.
        </Text>
        <div className="h-6" />
        <Button
          size="md"
          onClick={() =>
            setModalStateDetailed({ state: ModalState.GetSupportOnlyLink })
          }
        >
          Request a link
        </Button>
      </div>
    </>
  );
}

export default Index;
