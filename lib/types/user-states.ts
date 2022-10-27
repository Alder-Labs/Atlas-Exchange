import { SignupParams } from '../auth-token-context';

import { SigninParams, SigninWithMfaParams } from './signin';

export type UserState =
  | SignedOutUserState
  | NeedsMfaUserState
  | SignedInUserState
  | SupportOnlyUserState;

export type SignedOutUserState = {
  status: UserStateStatus.SIGNED_OUT;
  signIn: (params: SigninParams) => Promise<any>;
  signUp: (params: SignupParams) => Promise<any>;
};

export type NeedsMfaUserState = {
  status: UserStateStatus.NEEDS_MFA;
  token: string;
  signInWithMfa: (params: SigninWithMfaParams) => Promise<void>;
  signOut: () => Promise<void>;
};

export type SignedInUserState = {
  status: UserStateStatus.SIGNED_IN;
  token: string;
  signOut: () => Promise<void>;
  updateToken: (token: string) => Promise<void>;
};

export type SupportOnlyUserState = {
  status: UserStateStatus.SUPPORT_ONLY;
  token: string;
  signOut: () => Promise<void>;
};

export enum UserStateStatus {
  SIGNED_OUT = 'SIGNED_OUT',
  NEEDS_MFA = 'NEEDS_MFA',
  SIGNED_IN = 'SIGNED_IN',
  SUPPORT_ONLY = 'SUPPORT_ONLY',
  UNKNOWN = 'UNKNOWN',
}
