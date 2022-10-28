import { UserReduced } from './login-status';
import { RecaptchaParams } from './recaptcha';

export type MfaType = 'email' | 'sms' | 'totp' | null;

export type SigninParams = {
  email: string;
  password: string;
} & RecaptchaParams;

export type SigninWithMfaParams = {
  code: string;
};

export type SignInResponse = {
  token: string;
  captchaSubstitute: string | null;
  mfaMethod: MfaType;
  mfaRequired: boolean;
};

export type SignInWithMfaResponse = {
  token: string;
  target: UserReduced;
};
