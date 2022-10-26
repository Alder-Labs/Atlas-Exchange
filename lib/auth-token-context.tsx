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

interface User {
  token: string;
  status: 'needs-mfa' | 'logged-in';
}

export type SignupParams = {
  email: string;
  mfaMethod?: string;
  mfaVerified?: boolean;
  clientUserId?: string;
  acceptedWhitelabelTos: boolean;
  password: string;
} & RecaptchaParams;

type UserState =
  | {
      user: null;
      signin: (params: SigninParams) => Promise<SignInResponse>;
      signup: (params: SignupParams) => Promise<SignUpResponse>;
    }
  | {
      user: User;
      signinWithMfa: (params: SigninWithMfaParams) => Promise<void>;
      setUser: (
        user: SetStateAction<User | null | undefined>,
        callback?: (user: User | null | undefined) => void
      ) => void;
      signout: () => Promise<void>;
    };

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
  const [user, _setUser] = useStateCallback<User | null | undefined>(undefined);

  // const [authToken, _setUser] = useStateCallback<
  //   string | null | undefined
  // >(undefined);

  const setUser = useCallback(
    (
      user: SetStateAction<User | null | undefined>,
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
    const cachedUser = JSON.parse(
      localStorage.getItem('user') || 'null'
    ) as User | null;
    // we can no longer check token expiration because its encrypted
    const tokenDate = localStorage.getItem('tokenDate');

    if (tokenDate && Number(tokenDate) <= Date.now()) {
      setUser(null);
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
          setUser({ token: res.token, status: 'logged-in' }, () => {
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
              status: res.mfaRequired ? 'needs-mfa' : 'logged-in',
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
    if (!user) {
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
              status: 'logged-in',
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
    if (!user) {
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
          setUser(null);
          resolve(res);
        })
        .catch((err) => {
          localStorage.removeItem('token');
          queryClient.clear();
          setUser(null);
          reject(err);
        });
    });
  };

  if (typeof user === 'undefined') {
    // User state has not loaded; render nothing
    return null;
  }

  return (
    <UserContext.Provider
      value={
        user
          ? {
              user: user,
              signinWithMfa: signinWithMfa,
              signout: signout,
              setUser,
            }
          : {
              user: null,
              signin,
              signup,
            }
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

// Must be signed in
export function useUser() {
  const userState = useUserState();
  if (userState.user === null) {
    console.log(`userState: ${JSON.stringify(userState)}`);
    throw new Error('useUser: not signed in');
  }
  return userState.user;
}
