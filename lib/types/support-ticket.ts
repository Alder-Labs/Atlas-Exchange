// Request body to update a support ticket status
export type SupportTicketStatusUpdate = {
  status: 'closed';
};

// Request body to create a support ticket
export type SupportTicketCreate = {
  title: string;
  category: string;
  message: string;
  document?: File;
};

// Request body to add message to ticket
export type SupportMessageCreate = {
  message: string;
  supportFile?: File;
};

// Response from fetching all support tickets
export type SupportTicketWithMessages = {
  ticket: SupportTicket;
  messages: SupportTicketMessage[];
};

export type SupportTicket = {
  id: string;
  title: string;
  time: string;
  category: string;
  error: string | null;
  fiatCoin: string | null;
  fiatDeposit: string | null;
  depositHelpRequest: string | null;
  autoExpireAt: string | null;
  status: string;
};

export type SupportTicketMessage = {
  id: string;
  message: string;
  uploadedFileName: string | null;
  authorIsCustomer: boolean;
  time: string;
};
