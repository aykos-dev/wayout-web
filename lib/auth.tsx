'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

const TOKEN_KEY = 'booktrip.user.token';
const USER_KEY = 'booktrip.user.profile';

export interface AuthUser {
  id: string;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  avatarUrl?: string | null;
}

interface AuthCallbacks {
  open: () => Promise<AuthUser>;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  /** False until the session has been read from localStorage on mount. */
  ready: boolean;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
  /** Set by the AuthModal so any component can prompt sign-in. */
  requestLogin: () => Promise<AuthUser>;
  /** Mounting helper for the modal host — does NOT trigger re-renders. */
  _register: (resolver: AuthCallbacks) => void;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  // The modal opener lives in a ref so re-registering it from the modal host
  // does not produce a state update and trigger an infinite render loop.
  const callbacksRef = useRef<AuthCallbacks | null>(null);
  const userRef = useRef<AuthUser | null>(null);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    userRef.current = user;
    tokenRef.current = token;
  }, [user, token]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setToken(localStorage.getItem(TOKEN_KEY));
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw) as AuthUser);
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, []);

  const setSession = useCallback((nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const requestLogin = useCallback(() => {
    if (userRef.current && tokenRef.current) {
      return Promise.resolve(userRef.current);
    }
    if (!callbacksRef.current) {
      return Promise.reject(new Error('Auth modal not mounted yet'));
    }
    return callbacksRef.current.open();
  }, []);

  const register = useCallback((cb: AuthCallbacks) => {
    callbacksRef.current = cb;
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      token,
      user,
      ready,
      setSession,
      logout,
      requestLogin,
      _register: register,
    }),
    [token, user, ready, setSession, logout, requestLogin, register],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>');
  return v;
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
