export type MfaType = 'email' | 'sms' | 'totp' | null;

export type SignInResponse = {
  token: string;
  captchaSubstitute: string | null;
  mfaMethod: MfaType;
  mfaRequired: boolean;
};
