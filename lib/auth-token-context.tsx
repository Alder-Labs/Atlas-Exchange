import { createContext, useCallback, useContext, useEffect } from 'react';

import { useRouter } from 'next/router';
import { useQueryClient } from 'react-query';

import { useStateCallback } from '../hooks/useStateCallback';

import { RecaptchaParams, SigninParams, SignInResponse, SigninWithMfaParams } from './types';

interface User {
  token: string;
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
      signup: (params: SignupParams) => Promise<SignInResponse>;
    }
  | {
      user: User;
      signinWithMfa: (params: SigninWithMfaParams) => Promise<void>;
      setAuthToken: (
        token: string | null | undefined,
        callback?: (token: string | null | undefined) => void
      ) => void;
      signout: () => void;
    };

const UserContext = createContext<UserState | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  /**
   * authToken has 3 possible states:
   * 1. null: user is not signed in
   * 2. string: user is signed in
   * 3. undefined: state has not been initialized. In this case, UserProvider will
   *    not render any children.
   */
  const [authToken, _setAuthToken] = useStateCallback<
    string | null | undefined
  >(undefined);

  const setAuthToken = useCallback(
    (
      token: string | null | undefined,
      callback?: (token: string | null | undefined) => void
    ) => {
      _setAuthToken(token, callback);
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem(
          'tokenDate',
          // two day expiration
          (Date.now() + 1000 * 60 * 60 * 24 * 2).toString()
        );
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenDate');
      }
    },
    [_setAuthToken]
  );

  useEffect(() => {
    // In an effect since localStorage is not available during SSR
    const token = localStorage.getItem('token');
    // we can no longer check token expiration because its encrypted
    const tokenDate = localStorage.getItem('tokenDate');
    if (tokenDate && Number(tokenDate) <= Date.now()) {
      localStorage.removeItem('token');
      setAuthToken(null);
    } else {
      setAuthToken(token);
    }
  }, [setAuthToken]);

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

    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
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
      .then((res) => {
        return signin({
          email: data.email,
          password: data.password,
          captcha: {
            recaptcha_challenge: data.captcha.recaptcha_challenge,
          },
        });
      });
  };

  const signin = (data: SigninParams) => {
    return new Promise<SignInResponse>((resolve, reject) => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
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
        .then((res) => {
          setAuthToken(res.token, () => {
            resolve(res);
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const signinWithMfa = ({ code }: SigninWithMfaParams) => {
    if (!authToken) {
      throw new Error('Not signed in');
    }

    return new Promise<void>((resolve, reject) => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login_with_mfa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
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
          setAuthToken(res.token, () => {
            resolve();
          });
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const router = useRouter();
  const signout = () => {
    // Remove client-side session token
    localStorage.removeItem('token');
    queryClient.clear();
    setAuthToken(null);
    router.push('/');

    // TODO: Expire session server-side.
    // This is not currently supported, because FTX does not offer an endpoint
    // for expiring an individual session.

    // return new Promise<any>((resolve, reject) => {
    //   fetch(`${process.env.NEXT_PUBLIC_API_URL}/proxy/api/logout`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${authToken}`,
    //     },
    //     body: JSON.stringify({}),
    //   })
    //     .then((res) => {
    //       return res.json();
    //     })
    //     .then((res) => {
    //       // Remove client-side session token
    //       localStorage.removeItem('token');
    //       queryClient.clear();
    //       setAuthToken(null);
    //
    //       // Server-side session token expiration failed
    //       if (!res.success) throw new Error(res.error);
    //     })
    //     .then((res) => {
    //       resolve(res);
    //     })
    //     .catch((err) => {
    //       reject(err);
    //     });
    // });
  };

  if (typeof authToken === 'undefined') {
    return null;
  }

  return (
    <UserContext.Provider
      value={
        authToken
          ? {
              user: { token: authToken },
              signinWithMfa: signinWithMfa,
              signout: signout,
              setAuthToken,
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
