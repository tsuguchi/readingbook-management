"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiFetch, clearToken, getToken, setToken } from "@/lib/api";

export type User = {
  id: number;
  name: string;
  email: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

type AuthResponse = { user: User; token: string };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch<{ user: User }>("/api/v1/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      json: { email, password },
    });
    setToken(data.token);
    setUser(data.user);
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const data = await apiFetch<AuthResponse>("/api/v1/auth/signup", {
        method: "POST",
        json: { name, email, password },
      });
      setToken(data.token);
      setUser(data.user);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/v1/auth/logout", { method: "DELETE" });
    } catch {
      // Server-side is stateless; client cleanup is what matters.
    }
    clearToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
