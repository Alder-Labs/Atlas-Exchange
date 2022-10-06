import { requireEnvVar } from '../env';

export const RECAPTCHA_KEY = requireEnvVar('NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY');

export enum RecaptchaActions {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  CHANGEPASSWORD = 'CHANGEPASSWORD',
  SUPPORT = 'SUPPORT',
  SMS = 'SMS',
}

export type RecaptchaParams = {
  captcha: {
    recaptcha_challenge: string;
  };
};
