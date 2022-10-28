import {
  createContext,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import { useQueryClient } from 'react-query';

import { useStateCallback } from '../hooks/useStateCallback';

import { requireEnvVar } from './env';
import { LocalStorageKey } from './local-storage-keys';
import {
  LoginStatusReduced,
  MfaType,
  RecaptchaParams,
  SigninParams,
  SignInResponse,
  SigninWithMfaParams,
  SignInWithMfaResponse,
} from './types';
import { SardineSdkConfig } from './types/sardine';
import { SignUpResponse } from './types/signup';
import { UserState, UserStateStatus } from './types/user-states';

function clearLocalStorage() {
  // Keep some keys (don't delete them)

  const KEYS_TO_KEEP = [LocalStorageKey.WatchList];
  const VALUES_TO_KEEP = KEYS_TO_KEEP.map(
    (key) => localStorage.getItem(key) || ''
  );

  localStorage.clear();

  KEYS_TO_KEEP.forEach((key, i) => {
    localStorage.setItem(key, VALUES_TO_KEEP[i]);
  });
}

type User =
  | { status: 'UNKNOWN' }
  | { status: UserStateStatus.SIGNED_OUT; loginStatusData?: LoginStatusReduced }
  | {
      status: UserStateStatus.SUPPORT_ONLY;
      token: string;
      loginStatusData: LoginStatusReduced;
    }
  | {
      status: UserStateStatus.SIGNED_IN;
      token: string;
      loginStatusData: LoginStatusReduced;
    }
  | {
      status: UserStateStatus.NEEDS_MFA;
      token: string;
      loginStatusData: LoginStatusReduced;
    };

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

  // _setUser only to be called by setUser
  const [user, _setUser] = useStateCallback<User>({
    status: 'UNKNOWN',
  });

  // Only to be called in 3 places
  // 1. syncAuthStateWithServer
  // 2. Initial useEffect to set user from localstorage
  // 3. signOutInstantly
  const setUser = useCallback(
    (
      user: SetStateAction<User>,
      callback?: (user: User | null | undefined) => void
    ) => {
      if (user) {
        localStorage.setItem(LocalStorageKey.User, JSON.stringify(user));
        localStorage.setItem(LocalStorageKey.TokenDate, getTwoDaysFromNow());
      } else {
        localStorage.removeItem(LocalStorageKey.User);
        localStorage.removeItem(LocalStorageKey.TokenDate);
      }
      _setUser(user, callback);
    },
    [_setUser]
  );

  const syncAuthStateWithServer = useCallback(
    async (authToken?: string) => {
      console.log('Sync auth state with server');
      // Get sardine session key if possible
      const existingConfig = getSardineSdkConfigFromLocalstorage();

      // Fetch login status
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      if (existingConfig) {
        headers['X-Sardine-Session'] = existingConfig.context.sessionKey;
      }

      const fetchUrl = `${API_URL}/api/login_status`;

      const result = await fetch(fetchUrl, {
        method: 'GET',
        headers: headers,
      })
        .then((res) => res.json())
        .then((res) => {
          if (!res.success) {
            throw new Error(res.error);
          }
          return res.result as LoginStatusReduced;
        });

      const userStatus = getUserStatusFromLoginStatus(result);

      return new Promise((resolve, reject) => {
        switch (userStatus) {
          case UserStateStatus.SIGNED_OUT:
            setUser(
              {
                status: UserStateStatus.SIGNED_OUT,
                loginStatusData: result,
              },
              resolve
            );
            break;
          case UserStateStatus.SUPPORT_ONLY:
            if (!authToken) {
              reject(new Error('No auth token'));
              return;
            }
            setUser(
              {
                status: UserStateStatus.SUPPORT_ONLY,
                token: authToken,
                loginStatusData: result,
              },
              resolve
            );
            break;
          case UserStateStatus.SIGNED_IN:
            if (!authToken) {
              reject(new Error('No auth token'));
              return;
            }
            setUser(
              {
                status: UserStateStatus.SIGNED_IN,
                token: authToken,
                loginStatusData: result,
              },
              resolve
            );
            break;
          case UserStateStatus.NEEDS_MFA:
            if (!authToken) {
              reject(new Error('No auth token'));
              return;
            }
            setUser(
              {
                status: UserStateStatus.NEEDS_MFA,
                token: authToken,
                loginStatusData: result,
              },
              resolve
            );
            break;
        }
      });
    },
    [setUser]
  );

  /**
   * On initial load, check if there is a user in localstorage.
   * If there is, check if the token is still valid.
   * If it is, set the user to the localstorage user.
   *
   * If there is no user in localstorage, set the user to SIGNED_OUT
   *
   * This code should only run once, on initial load.
   */
  useEffect(() => {
    const cachedUser = JSON.parse(
      localStorage.getItem(LocalStorageKey.User) || '{}'
    );
    // if (!validCachedUser(cachedUser)) {
    //   setUser({ status: UserStateStatus.SIGNED_OUT });
    // }

    const tokenDate = localStorage.getItem(LocalStorageKey.TokenDate);
    if ((tokenDate && Number(tokenDate) <= Date.now()) || !cachedUser) {
      setUser({ status: UserStateStatus.SIGNED_OUT });
    } else {
      setUser(cachedUser);
    }

    syncAuthStateWithServer(cachedUser.token);
  }, [setUser, syncAuthStateWithServer]);

  const signup = useCallback(
    (data: SignupParams) => {
      const signupRequest = createSignupRequest(data);
      return fetch(`${API_URL}/users`, {
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
        .then(async (res: SignUpResponse) => {
          await syncAuthStateWithServer(res.token);
          return res;
        });
    },
    [syncAuthStateWithServer]
  );

  const signin = useCallback(
    (data: SigninParams) => {
      return fetch(`${API_URL}/users/login`, {
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
        .then(async (res: SignInResponse) => {
          await syncAuthStateWithServer(res.token);
          return res;
        });
    },
    [syncAuthStateWithServer]
  );

  const signOutInstantly = useCallback(async () => {
    if (
      !user ||
      user.status === UserStateStatus.SIGNED_OUT ||
      user.status === 'UNKNOWN'
    ) {
      throw new Error('Not signed in');
    }

    // Instantly set user to signed out on client side
    setUser({ status: UserStateStatus.SIGNED_OUT });
    clearLocalStorage();
    queryClient.clear();

    // Pass no token -> login status data will be signed out
    syncAuthStateWithServer();

    // Invalidate token on server
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
      });
  }, [queryClient, setUser, syncAuthStateWithServer, user]);

  const signinWithMfa = useCallback(
    ({ code }: SigninWithMfaParams) => {
      if (!user || user.status !== UserStateStatus.NEEDS_MFA) {
        throw new Error('Not signed in');
      }

      return fetch(`${API_URL}/users/login_with_mfa`, {
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
        .then(async (res: SignInWithMfaResponse) => {
          await syncAuthStateWithServer(res.token);
          return res;
        });
    },
    [syncAuthStateWithServer, user]
  );

  const updateToken = useCallback(
    async (token: string) => {
      await syncAuthStateWithServer(token);
    },
    [syncAuthStateWithServer]
  );

  const userState: UserState = useMemo(() => {
    switch (user.status) {
      case UserStateStatus.SUPPORT_ONLY:
        return {
          status: user.status,
          token: user.token,
          loginStatusData: user.loginStatusData,
          signOut: signOutInstantly,
          updateToken: updateToken,
        };
      case UserStateStatus.NEEDS_MFA:
        return {
          status: user.status,
          token: user.token,
          loginStatusData: user.loginStatusData,
          signInWithMfa: signinWithMfa,
          signOut: signOutInstantly,
          updateToken: updateToken,
        };
      case UserStateStatus.SIGNED_IN:
        return {
          status: user.status,
          token: user.token,
          loginStatusData: user.loginStatusData,
          signOut: signOutInstantly,
          updateToken: updateToken,
        };
      case UserStateStatus.SIGNED_OUT:
      case 'UNKNOWN':
        return {
          status: UserStateStatus.SIGNED_OUT,
          signIn: signin,
          signUp: signup,
          updateToken: updateToken,
        };
    }
  }, [user, signin, signup, signinWithMfa, signOutInstantly, updateToken]);

  if (user.status === 'UNKNOWN') {
    // User state has not loaded; render nothing
    return null;
  }
  return (
    <UserContext.Provider value={userState}>{children}</UserContext.Provider>
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

function getSardineSdkConfigFromLocalstorage(): SardineSdkConfig | null {
  const config = localStorage.getItem(LocalStorageKey.SardineSdkConfig);
  if (config) {
    return JSON.parse(config) as SardineSdkConfig;
  }
  return null;
}

function getUserStatusFromLoginStatus(
  loginStatus: LoginStatusReduced
): UserStateStatus {
  if (loginStatus.loggedIn === true) {
    if (loginStatus.supportOnly) {
      return UserStateStatus.SUPPORT_ONLY;
    } else {
      return UserStateStatus.SIGNED_IN;
    }
  } else {
    if (loginStatus.mfaRequired === null) {
      return UserStateStatus.SIGNED_OUT;
    } else {
      return UserStateStatus.NEEDS_MFA;
    }
  }
}
