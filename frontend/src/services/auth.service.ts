import type { LoginFormValues, RegisterInput } from "@/schemas/auth.schema";
import type { AuthSession, User } from "@/types/user";
import { apiRequest, refreshSession, tokenStore, setSessionListener } from "./api";

/**
 * Authentication endpoints (Express + JWT).
 *   POST /auth/register     creates the account (no session is started)
 *   POST /auth/login        returns an access token; the server sets the httpOnly refresh cookie
 *   POST /auth/refresh      rotates the refresh cookie and returns a new access token
 *   POST /auth/logout       deletes the refresh session and clears the cookie
 *   GET  /auth/me           the current user (protected)
 *   PATCH /profile/me       updates the current user's profile
 *   PATCH /profile/me/password  changes the current user's password (invalidates sessions)
 */

interface Envelope<T> {
  status: string;
  data: T;
}

interface ProfileResponse {
  message: string;
  profile: User;
}

interface PasswordChangeResponse {
  message: string;
}

export const authService = {
  async register(input: RegisterInput): Promise<User> {
    const response = await apiRequest<Envelope<{ user: User }>>(
      "/auth/register",
      {
        method: "POST",
        body: input,
      },
    );
    return response.data.user;
  },

  async login({ email, password }: LoginFormValues): Promise<AuthSession> {
    const response = await apiRequest<
      Envelope<{ user: User; accessToken: string }>
    >("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    tokenStore.set(response.data.accessToken);
    return { user: response.data.user, accessToken: response.data.accessToken };
  },

  async logout(): Promise<void> {
    await apiRequest("/auth/logout", { method: "POST" });
  },

  /** Recovers a session from the refresh cookie. Null when there is none. */
  refresh(): Promise<AuthSession | null> {
    return refreshSession();
  },

  /** Protected: also the simplest way to test the expired-token flow. */
  async me(): Promise<User> {
    const response = await apiRequest<Envelope<{ user: User }>>("/auth/me", {
      auth: true,
    });
    return response.data.user;
  },

  async updateProfile(input: { name: string; email: string }): Promise<User> {
    const response = await apiRequest<Envelope<ProfileResponse>>("/profile/me", {
      method: "PATCH",
      body: input,
      auth: true,
    });
    return response.data.profile;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiRequest<Envelope<PasswordChangeResponse>>("/profile/me/password", {
      method: "PATCH",
      body: { currentPassword, newPassword },
      auth: true,
    });
    // Backend invalidates refresh sessions; clear local auth state
    tokenStore.set(null);
    setSessionListener(null);
    // The AuthProvider's session listener will be called with null by the API client
    // when the 401 is encountered on the next request, but we proactively clear here.
  },
};
