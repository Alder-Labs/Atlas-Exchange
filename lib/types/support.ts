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

// If a user cannot access their email, they may still submit a support ticket
// with this request schema
export type PublicCreateTicket = {
  deviceId?: string;
  email: string;
  firstName: string;
  lastName: string;
  userMessage: string;
  captcha: {
    recaptcha_challenge: string;
  };
};

/* ----------------------------------------------------------------------------
 * Steps to get a SUPPORT-ONLY authorization token
 * 1. User requests a link be sent to their email. This email contains a code.
 * 2. The link redirects a user to a support page. Here the code is extracted
 *    from the URL and used to fetch a token.
 * ------------------------------------------------------------------------- */

export type SupportOnlyLinkRequest = {
  captcha: {
    recaptcha_challenge: string;
  };
  deviceId?: string;
  email: string;
};

export type SupportOnlyTokenRequest = {
  code: string;
  deviceId?: string;
};

export type SupportOnlyTokenResponse = {
  result: string; // Authorization token
};
