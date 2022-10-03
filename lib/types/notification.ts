export type Notification = {
  id: number;
  subaccount: string;
  created_at: string;
  unread: boolean;
  notification_type: string;
  subject: string;
  body: string;
};
