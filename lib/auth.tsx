"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { auth } from "../services/mockApi";

type User = { id: string; name: string; email: string; role: string } | null;
type Session = { sessionId: string; userId: string } | null;

type AuthContextValue = {
  user: User;
  session: Session;
  loading: boolean;
  isGuest: boolean;
  signup: (payload: any) => Promise<any>;
  login: (payload: { email: string; password: string }) => Promise<any>;
  guestLogin: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_KEY = "parking_app_session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // restore session from localStorage
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(SESSION_KEY) : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSession(parsed.session);
        setUser(parsed.user);
        setIsGuest(false);
      } catch (e) {
        // ignore
      }
    }
    setLoading(false);
  }, []);

  const persist = useCallback((userObj: User, sessionObj: Session) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ user: userObj, session: sessionObj }));
  }, []);

  const signup = useCallback(async (payload: { name: string; email: string; password: string; role?: string }) => {
    const res = await auth.signup(payload);
    if (res.ok && res.data) {
      setUser(res.data.user);
      setSession(res.data.session);
      setIsGuest(false);
      persist(res.data.user, res.data.session);
    }
    return res;
  }, [persist]);

  const login = useCallback(async (payload: { email: string; password: string }) => {
    const res = await auth.login(payload);
    if (res.ok && res.data) {
      setUser(res.data.user);
      setSession(res.data.session);
      setIsGuest(false);
      persist(res.data.user, res.data.session);
    }
    return res;
  }, [persist]);

  const guestLogin = useCallback(() => {
    const guestId = `guest_${Math.random().toString(36).slice(2, 10)}`;
    setUser({ id: guestId, name: "Demo User", email: "guest@example.com", role: "guest" });
    setSession(null);
    setIsGuest(true);
  }, []);

  const logout = useCallback(async () => {
    if (session) {
      await auth.logout().catch(() => {});
    }
    setUser(null);
    setSession(null);
    setIsGuest(false);
    if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
  }, [session]);

  const value = useMemo(
    () => ({ user, session, loading, isGuest, signup, login, guestLogin, logout }),
    [user, session, loading, isGuest, signup, login, guestLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
