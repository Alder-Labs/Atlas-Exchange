import { useMemo } from 'react';

import { useQuery } from 'react-query';

import { useFetcher } from '../../lib/fetcher';
import { QueryProps } from '../../lib/queryProps';

import type { SupportTicketWithMessages } from '../../lib/types';

export function useSupportMessages(
  input: { ticketId: string },
  props: QueryProps<SupportTicketWithMessages> = {}
) {
  const { ticketId } = input;

  const {
    data: supportData,
    error,
    isLoading,
    refetch,
  } = useQuery(
    `/proxy/api/support/tickets/${ticketId}/messages`,
    useFetcher<SupportTicketWithMessages>(),
    props
  );

  return useMemo(() => {
    return {
      ticket: supportData?.ticket,
      messages: supportData?.messages,
      error,
      refetch,
      isLoading,
    };
  }, [supportData, error, refetch, isLoading]);
}
