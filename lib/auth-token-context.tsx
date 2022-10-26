import {
  createContext,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import { useQueryClient } from 'react-query';

import { useStateCallback } from '../hooks/useStateCallback';

import { requireEnvVar } from './env';
import {
  RecaptchaParams,
  SigninParams,
  SignInResponse,
  SigninWithMfaParams,
} from './types';
import { SignUpResponse } from './types/signup';

type User =
  | { status: UserStateType.UNKNOWN }
  | { status: UserStateType.SIGNED_OUT }
  | { status: UserStateType.SUPPORT_ONLY; token: string }
  | { status: UserStateType.SIGNED_IN; token: string }
  | { status: UserStateType.NEEDS_MFA; token: string };

export type UserState =
  | UnknownUserState
  | SignedOutUserState
  | NeedsMfaUserState
  | SignedInUserState
  | SupportOnlyUserState;

export type UnknownUserState = {
  user: { status: UserStateType.UNKNOWN };
};

export type SignedOutUserState = {
  user: { status: UserStateType.SIGNED_OUT };
  signIn: (params: SigninParams) => Promise<any>;
  signUp: (params: SignupParams) => Promise<any>;
};

export type NeedsMfaUserState = {
  user: { status: UserStateType.NEEDS_MFA; token: string };
  signInWithMfa: (params: SigninWithMfaParams) => Promise<void>;
  signOut: () => Promise<void>;
};

export type SignedInUserState = {
  user: { status: UserStateType.SIGNED_IN; token: string };
  signOut: () => Promise<void>;
  updateToken: (token: string) => void;
};

export type SupportOnlyUserState = {
  user: { status: UserStateType.SUPPORT_ONLY; token: string };
  signOut: () => Promise<void>;
};

export enum UserStateType {
  UNKNOWN = 'UNKNOWN',
  SIGNED_OUT = 'SIGNED_OUT',
  NEEDS_MFA = 'NEEDS_MFA',
  SIGNED_IN = 'SIGNED_IN',
  SUPPORT_ONLY = 'SUPPORT_ONLY',
}

export type SignupParams = {
  email: string;
  mfaMethod?: string;
  mfaVerified?: boolean;
  clientUserId?: string;
  acceptedWhitelabelTos: boolean;
  password: string;
} & RecaptchaParams;

// type UserState =
//   | {
//       user: null;
//       signin: (params: SigninParams) => Promise<SignInResponse>;
//       signup: (params: SignupParams) => Promise<SignUpResponse>;
//     }
//   | {
//       user: User;
//       signinWithMfa: (params: SigninWithMfaParams) => Promise<void>;
//       setUser: (
//         user: SetStateAction<User | null | undefined>,
//         callback?: (user: User | null | undefined) => void
//       ) => void;
//       signout: () => Promise<void>;
//     };

const UserContext = createContext<UserState | undefined>(undefined);

const API_URL = requireEnvVar('NEXT_PUBLIC_API_URL');

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  /**
   * authToken has 3 possible states:
   * 1. null: user is not signed in
   * 2. string: user is signed in
   * 3. undefined: state has not been initialized. In this case, UserProvider will
   *    not render any children.
   */
  const [user, _setUser] = useStateCallback<User>({
    status: UserStateType.UNKNOWN,
  });

  // const [authToken, _setUser] = useStateCallback<
  //   string | null | undefined
  // >(undefined);

  const setUser = useCallback(
    (
      user: SetStateAction<User>,
      callback?: (user: User | null | undefined) => void
    ) => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem(
          'tokenDate',
          // two day expiration
          (Date.now() + 1000 * 60 * 60 * 24 * 2).toString()
        );
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('tokenDate');
      }
      _setUser(user, callback);
    },
    [_setUser]
  );

  useEffect(() => {
    // In an effect since localStorage is not available during SSR
    // we can no longer check token expiration because its encrypted

    const cachedUser = JSON.parse(
      localStorage.getItem('user') || 'null'
    ) as User | null;
    const tokenDate = localStorage.getItem('tokenDate');

    if ((tokenDate && Number(tokenDate) <= Date.now()) || !cachedUser) {
      setUser({ status: UserStateType.SIGNED_OUT });
    } else {
      setUser(cachedUser);
    }
  }, [setUser]);

  const signup = (data: SignupParams) => {
    const signupReq = {
      email: data.email,
      noPassword: false,
      password: data.password,
      acceptedWhitelabelTos: data.acceptedWhitelabelTos ? true : false,
      clientUserId: data.clientUserId,
      captcha: {
        recaptcha_challenge: data.captcha.recaptcha_challenge,
      },
    };

    return new Promise<SignUpResponse>((resolve, reject) => {
      fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupReq),
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          if (!res.success) {
            throw new Error(res.error);
          }
          return res.result;
        })
        .then((res: SignUpResponse) => {
          setUser({ token: res.token, status: UserStateType.SIGNED_IN }, () => {
            resolve(res);
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const signin = (data: SigninParams) => {
    return new Promise<SignInResponse>((resolve, reject) => {
      fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          if (!res.success) {
            throw new Error(res.error);
          }
          return res.result;
        })
        .then((res: SignInResponse) => {
          setUser(
            {
              token: res.token,
              status: res.mfaRequired
                ? UserStateType.NEEDS_MFA
                : UserStateType.SIGNED_IN,
            },
            () => {
              resolve(res);
            }
          );
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const signinWithMfa = ({ code }: SigninWithMfaParams) => {
    if (!user || user.status !== UserStateType.NEEDS_MFA) {
      throw new Error('Not signed in');
    }

    return new Promise<void>((resolve, reject) => {
      fetch(`${API_URL}/users/login_with_mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          code: code,
        }),
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          if (!res.success) {
            throw new Error(res.error);
          }
          return res.result;
        })
        .then((res) => {
          console.log(res);
          setUser(
            {
              token: res.token,
              status: UserStateType.SIGNED_IN,
            },
            () => {
              resolve();
            }
          );
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const signout = () => {
    if (
      !user ||
      user.status === UserStateType.SIGNED_OUT ||
      user.status === UserStateType.UNKNOWN
    ) {
      throw new Error('Not signed in');
    }

    return new Promise<void>((resolve, reject) => {
      fetch(`${API_URL}/users/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({}),
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          if (!res.success) throw new Error(res.error);
          return;
        })
        .then((res) => {
          localStorage.removeItem('token');
          queryClient.clear();
          setUser({ status: UserStateType.SIGNED_OUT });
          resolve(res);
        })
        .catch((err) => {
          localStorage.removeItem('token');
          queryClient.clear();
          setUser({ status: UserStateType.SIGNED_OUT });
          reject(err);
        });
    });
  };

  return (
    <UserContext.Provider
      value={
        user.status === UserStateType.SUPPORT_ONLY
          ? {
              user: user,
              signOut: signout,
            }
          : user.status === UserStateType.NEEDS_MFA
          ? {
              user: user,
              signInWithMfa: signinWithMfa,
              signOut: signout,
            }
          : user.status === UserStateType.SIGNED_IN
          ? {
              user: user,
              signOut: signout,
              updateToken: () => {},
            }
          : user.status === UserStateType.UNKNOWN
          ? { user: { status: UserStateType.UNKNOWN } }
          : { user: user, signIn: signin, signUp: signup }
      }
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUserState(): UserState {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserState must be used within a UserProvider');
  }
  return context;
}
