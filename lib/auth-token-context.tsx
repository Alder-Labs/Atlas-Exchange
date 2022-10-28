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
import { UserState, UserStateStatus } from './types/user-states';

type User =
  | { status: 'UNKNOWN' }
  | { status: UserStateStatus.SIGNED_OUT }
  | { status: UserStateStatus.SUPPORT_ONLY; token: string }
  | { status: UserStateStatus.SIGNED_IN; token: string }
  | { status: UserStateStatus.NEEDS_MFA; token: string };

export type SignupParams = {
  email: string;
  mfaMethod?: string;
  mfaVerified?: boolean;
  clientUserId?: string;
  acceptedWhitelabelTos: boolean;
  password: string;
} & RecaptchaParams;

const UserContext = createContext<UserState | undefined>(undefined);

const API_URL = requireEnvVar('NEXT_PUBLIC_API_URL');

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const [user, _setUser] = useStateCallback<User>({
    status: 'UNKNOWN',
  });

  const setUser = useCallback(
    (
      user: SetStateAction<User>,
      callback?: (user: User | null | undefined) => void
    ) => {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('tokenDate', getTwoDaysFromNow());
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('tokenDate');
      }
      _setUser(user, callback);
    },
    [_setUser]
  );

  // In an effect since localStorage is not available during SSR
  // we can no longer check token expiration because its encrypted
  useEffect(() => {
    const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!validCachedUser(cachedUser)) {
      setUser({ status: UserStateStatus.SIGNED_OUT });
    }

    const tokenDate = localStorage.getItem('tokenDate');
    if ((tokenDate && Number(tokenDate) <= Date.now()) || !cachedUser) {
      setUser({ status: UserStateStatus.SIGNED_OUT });
    } else {
      setUser(cachedUser);
    }
  }, [setUser]);

  const signup = (data: SignupParams) => {
    const signupRequest = createSignupRequest(data);
    return new Promise<SignUpResponse>((resolve, reject) => {
      fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupRequest),
      })
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          if (!res.success) throw new Error(res.error);
          return res.result;
        })
        .then((res: SignUpResponse) => {
          setUser(
            { token: res.token, status: UserStateStatus.SIGNED_IN },
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
                ? UserStateStatus.NEEDS_MFA
                : UserStateStatus.SIGNED_IN,
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
    if (!user || user.status !== UserStateStatus.NEEDS_MFA) {
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
              status: UserStateStatus.SIGNED_IN,
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
      user.status === UserStateStatus.SIGNED_OUT ||
      user.status === 'UNKNOWN'
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
          setUser({ status: UserStateStatus.SIGNED_OUT });
          resolve(res);
        })
        .catch((err) => {
          localStorage.removeItem('token');
          queryClient.clear();
          setUser({ status: UserStateStatus.SIGNED_OUT });
          reject(err);
        });
    });
  };

  const updateToken = (token: string) => {
    return new Promise<void>((resolve, reject) => {
      setUser({ status: UserStateStatus.SIGNED_IN, token }, () => {
        resolve();
      });
    });
  };

  if (user.status === 'UNKNOWN') {
    // User state has not loaded; render nothing
    return null;
  }

  return (
    <UserContext.Provider
      value={
        user.status === UserStateStatus.SUPPORT_ONLY
          ? {
              status: user.status,
              token: user.token,
              signOut: signout,
            }
          : user.status === UserStateStatus.NEEDS_MFA
          ? {
              status: user.status,
              token: user.token,
              signInWithMfa: signinWithMfa,
              signOut: signout,
            }
          : user.status === UserStateStatus.SIGNED_IN
          ? {
              status: user.status,
              token: user.token,
              signOut: signout,
              updateToken: updateToken,
            }
          : {
              status: user.status,
              signIn: signin,
              signUp: signup,
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

function validUserStateState(data: string): boolean {
  for (const status in UserStateStatus) {
    if (status === data) {
      return true;
    }
  }
  return false;
}

function validCachedUser(data: any): boolean {
  if (!data.status) {
    return false;
  }
  if (!validUserStateState(data.status)) {
    return false;
  }
  return true;
}

function createSignupRequest(data: SignupParams) {
  return {
    email: data.email,
    noPassword: false,
    password: data.password,
    acceptedWhitelabelTos: data.acceptedWhitelabelTos ? true : false,
    clientUserId: data.clientUserId,
    captcha: {
      recaptcha_challenge: data.captcha.recaptcha_challenge,
    },
  };
}

function getTwoDaysFromNow(): string {
  return (Date.now() + 1000 * 60 * 60 * 24 * 2).toString();
}
