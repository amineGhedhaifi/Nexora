export type UserRole = "CLIENT" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Returned by /auth/register and /auth/me, not by /auth/login or /auth/refresh. */
  createdAt?: string;
}

/** What login and refresh return: the user plus a short-lived access token. */
export interface AuthSession {
  user: User;
  accessToken: string;
}
