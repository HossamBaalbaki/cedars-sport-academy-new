"use client";

/**
 * Auth Context — Cedars Sport Academy
 *
 * Provides authentication state and actions (login, register, logout, getProfile)
 * to the entire app. Stores JWT token in localStorage and auto-loads user on mount.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  tenantId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    phone?: string,
    role?: "PARENT" | "STUDENT"
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Cookie helpers (for middleware access) ────────────────────────────────
  const setCookieToken = (jwt: string) => {
    document.cookie = `auth_token=${jwt}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  };
  const clearCookieToken = () => {
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
  };

  // ── Load persisted session on mount ──────────────────────────────────────
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setCookieToken(storedToken);
      }
    } catch {
      // Corrupted storage — clear it
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      clearCookieToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Role-based redirect helper ────────────────────────────────────────────
  const getDashboardRoute = (role: string): string => {
    switch (role) {
      case "SUPER_ADMIN":
      case "ADMIN":
        return "/dashboard/admin";
      case "COACH":
        return "/dashboard/coach";
      case "STUDENT":
        return "/dashboard/student";
      case "PARENT":
      default:
        return "/dashboard";
    }
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authApi.login({ email, password });
        const { token: jwt, user: userData } = res.data as {
          token: string;
          user: AuthUser;
        };

        localStorage.setItem(TOKEN_KEY, jwt);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setCookieToken(jwt);
        setToken(jwt);
        setUser(userData);
        router.push(getDashboardRoute(userData.role));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Login failed. Please try again.";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      phone?: string,
      role: "PARENT" | "STUDENT" = "PARENT"
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authApi.register({
          firstName,
          lastName,
          email,
          password,
          phone,
          role,
        });
        const { token: jwt, user: userData } = res.data as {
          token: string;
          user: AuthUser;
        };

        localStorage.setItem(TOKEN_KEY, jwt);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setCookieToken(jwt);
        setToken(jwt);
        setUser(userData);
        router.push(getDashboardRoute(userData.role));
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Registration failed. Please try again.";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearCookieToken();
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  // ── Clear Error ───────────────────────────────────────────────────────────
  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
