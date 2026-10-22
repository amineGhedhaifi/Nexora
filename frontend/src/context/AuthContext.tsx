import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { refreshSession, setSessionListener, tokenStore } from "@/services/api";
import { authService } from "@/services/auth.service";
import type { AuthSession, User } from "@/types/user";
import { AuthContext, type AuthContextValue } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** The one place where the session is written (state and the API client's token). */
  const applySession = useCallback((session: AuthSession | null) => {
    tokenStore.set(session?.accessToken ?? null);
    setAccessToken(session?.accessToken ?? null);
    setUser(session?.user ?? null);
  }, []);

  // The API client reports silent refreshes and expired sessions through this listener
  useEffect(() => {
    setSessionListener(applySession);
    return () => setSessionListener(null);
  }, [applySession]);

  // On app load, recover the session from the httpOnly refresh cookie.
  // refreshSession() is shared, so React StrictMode's double effect still makes one request.
  useEffect(() => {
    let cancelled = false;
    refreshSession()
      .then((session) => {
        if (!cancelled) applySession(session);
      })
      .catch(() => {
        // Network or server error while restoring: continue as signed out
        if (!cancelled) applySession(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applySession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await authService.login({ email, password });
      applySession(session);
      return session.user;
    },
    [applySession],
  );

  // Registering does not start a session: the user signs in afterwards
  const register = useCallback(
    (name: string, email: string, password: string) =>
      authService.register({ name, email, password }),
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // If the cookie is already gone (or the request fails) we still sign out locally
    } finally {
      applySession(null);
    }
  }, [applySession]);

  const refreshAccessToken = useCallback(async () => {
    const session = await refreshSession();
    applySession(session);
    return session?.accessToken ?? null;
  }, [applySession]);

  const updateProfile = useCallback(
    async (input: { name: string; email: string }) => {
      const updatedUser = await authService.updateProfile(input);
      // Update the user in state with the new data
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : prev));
      return updatedUser;
    },
    [],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await authService.changePassword(currentPassword, newPassword);
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: user !== null,
      isLoading,
      register,
      login,
      logout,
      signOut: logout,
      refreshAccessToken,
      updateProfile,
      changePassword,
    }),
    [user, accessToken, isLoading, register, login, logout, refreshAccessToken, updateProfile, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
