export type Card = {
  id: string;
  name: string;
  time: string;
  billingInfo: {
    city: string;
    name: string;
    line1: string;
    line2: string;
    country: string;
    district: string;
    postalCode: string;
  };
  depositVerificationStatus: string;
  depositVerificationErrorCode: string;
  status: string;
  data: {
    mask: string;
  };
  errorCode: string | null;
};
