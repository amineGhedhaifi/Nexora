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
  /** Alias for logout. */
  signOut: () => Promise<void>;
  /** Manually refreshes the session. Returns the new access token, or null if signed out. */
  refreshAccessToken: () => Promise<string | null>;
  /** Update the current user's profile. */
  updateProfile: (input: { name: string; email: string }) => Promise<User>;
  /** Change the current user's password. */
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
