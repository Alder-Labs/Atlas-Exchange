export interface KycPersonForm {
  fullLegalName: string;
  year: string;
  month: string;
  day: string;
}

export interface KycAddress {
  country: string;
  streetAddress: string;
  stateProvinceRegion: string;
  city: string;
  postalCode: string;
}

export interface KycSsn {
  socialSecurityNumber: string;
}

export interface KycPhone {
  countryCode: string;
  phoneNumber: string;
  smsCode: string;
  previousMfaCode: string;
}

export type KycRawForm = KycPersonForm & KycAddress & KycPhone & KycSsn;

export interface KycForm {
  country: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  stateProvinceRegion: string;
  fullLegalName: string;
  phoneNumber: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  smsCode: string;
}

export interface IdentityVerification {
  idDocFront: File;
  idDocBack: File;
  idSelfie: File;
}

export interface StripeVerificationSession {
  id: string;
  object: string;
  client_secret: null | string;
  created: number;
  last_error: any | null;
  last_verification_report: string;
  livemode: boolean;
  metadata: any | null;
  options: any | null;
  redaction: null;
  status: 'requires_input' | 'processing' | 'verified' | 'canceled';
  type: 'document' | 'id_number';
  url: null | string;
}
