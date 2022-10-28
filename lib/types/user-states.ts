import { SignupParams } from '../auth-token-context';

import { LoginStatusReduced } from './login-status';
import {
  MfaType,
  SigninParams,
  SignInResponse,
  SigninWithMfaParams,
  SignInWithMfaResponse,
} from './signin';
import { SignUpResponse } from './signup';

export type UserState =
  | SignedOutUserState
  | NeedsMfaUserState
  | SignedInUserState
  | SupportOnlyUserState;

export type SignedOutUserState = {
  status: UserStateStatus.SIGNED_OUT;
  loginStatusData?: LoginStatusReduced;
  signIn: (params: SigninParams) => Promise<SignInResponse>;
  signUp: (params: SignupParams) => Promise<SignUpResponse>;
  updateToken: (token: string) => Promise<void>;
};

export type NeedsMfaUserState = {
  status: UserStateStatus.NEEDS_MFA;
  token: string;
  loginStatusData: LoginStatusReduced;
  signInWithMfa: (
    params: SigninWithMfaParams
  ) => Promise<SignInWithMfaResponse>;
  signOut: () => Promise<void>;
  updateToken: (token: string) => Promise<void>;
};

export type SignedInUserState = {
  status: UserStateStatus.SIGNED_IN;
  token: string;
  loginStatusData: LoginStatusReduced;
  signOut: () => Promise<void>;
  updateToken: (token: string) => Promise<void>;
};

export type SupportOnlyUserState = {
  status: UserStateStatus.SUPPORT_ONLY;
  token: string;
  loginStatusData: LoginStatusReduced;
  signOut: () => Promise<void>;
  updateToken: (token: string) => Promise<void>;
};

export enum UserStateStatus {
  SIGNED_OUT = 'SIGNED_OUT',
  NEEDS_MFA = 'NEEDS_MFA',
  SIGNED_IN = 'SIGNED_IN',
  SUPPORT_ONLY = 'SUPPORT_ONLY',
}
