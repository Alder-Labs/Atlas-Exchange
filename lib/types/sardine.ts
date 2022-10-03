export type SardineSdkConfig = {
  context: {
    clientId: string;
    sessionKey: string;
    userIdHash: string;
    flow: string;
    environment: string;
    partnerId: string;
  };
  sardineUrl: string;
};
