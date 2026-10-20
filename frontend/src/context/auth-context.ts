import { createContext } from "react";
import type { User } from "@/types/user";

export interface AuthContextValue {
  user: User | null;
  /** Lives in memory only. Consumers rarely need it: use the API client for requests. */
  accessToken: string | null;
  isAuthenticated: boolean;
  /** True while the app checks whether a session already exists (page load). */
  isLoading: boolean;
  register: (name: string, email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  /** Manually refreshes the session. Returns the new access token, or null if signed out. */
  refreshAccessToken: () => Promise<string | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
