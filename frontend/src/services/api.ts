import type { AuthSession, User } from "@/types/user";

/**
 * The single API client. Every request to the Nexora API goes through here.
 *
 * Auth model:
 * - The short-lived access token lives only in memory (the variable below). It is
 *   never written to localStorage or sessionStorage.
 * - The refresh token is an httpOnly cookie managed by the backend. JavaScript
 *   cannot read it; the browser sends it because every request uses
 *   `credentials: "include"`.
 * - Protected requests (`auth: true`) send the access token. If one returns 401,
 *   the client refreshes the session once and retries the request once.
 */

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const NETWORK_MESSAGE =
  "We couldn't reach the server. Check your connection and try again.";
const SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please sign in again.";

const FALLBACK_MESSAGES: Record<number, string> = {
  400: "Please check the information you entered and try again.",
  401: "You need to sign in to do that.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: "That already exists.",
  429: "Too many attempts. Please wait a moment and try again.",
};

function fallbackMessage(status: number): string {
  if (status === 0) return NETWORK_MESSAGE;
  if (status >= 500)
    return "Something went wrong on our side. Please try again later.";
  return FALLBACK_MESSAGES[status] ?? "Something went wrong. Please try again.";
}

const API_PREFIX = "/api";

/**
 * VITE_API_URL is only the origin, WITHOUT "/api" (the prefix is added to every request):
 *   ""                       same origin as the page. In development the Vite proxy
 *                            forwards /api to the backend, so there is no CORS at all.
 *   "http://localhost:8000"  call the backend directly (needs CORS with credentials).
 */
export function getApiOrigin(): string {
  const url = (import.meta.env.VITE_API_URL as string | undefined) ?? "";
  // Tolerate a trailing slash, or a "/api" added by habit
  return url.replace(/\/+$/, "").replace(/\/api$/, "");
}

/** Safe message for the interface: never a stack trace or technical detail. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}

// ---------------------------------------------------------------------------
// Access token (memory only)
// ---------------------------------------------------------------------------

let accessToken: string | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
};

/** Lets the API client tell the app that the session changed (silent refresh, or expiry). */
type SessionListener = (session: AuthSession | null) => void;
let sessionListener: SessionListener | null = null;

export function setSessionListener(listener: SessionListener | null): void {
  sessionListener = listener;
}

// ---------------------------------------------------------------------------
// Low-level request
// ---------------------------------------------------------------------------

async function toApiError(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => null)) as {
    message?: unknown;
  } | null;
  // Show the server's message for client errors; hide server-error internals
  const message =
    response.status < 500 &&
    typeof body?.message === "string" &&
    body.message.trim()
      ? body.message
      : fallbackMessage(response.status);
  return new ApiError(message, response.status);
}

interface SendOptions {
  method: string;
  body?: unknown;
  token?: string | null;
}

async function send(
  path: string,
  { method, body, token }: SendOptions,
): Promise<Response> {
  const baseUrl = getApiOrigin();
  try {
    return await fetch(`${baseUrl}${API_PREFIX}${path}`, {
      method,
      credentials: "include", // sends and receives the httpOnly refresh cookie
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(NETWORK_MESSAGE, 0);
  }
}

// ---------------------------------------------------------------------------
// Session refresh (one at a time)
// ---------------------------------------------------------------------------

let refreshPromise: Promise<AuthSession | null> | null = null;

async function performRefresh(): Promise<AuthSession | null> {
  const response = await send("/auth/refresh", { method: "POST" });

  // No cookie, or an invalid or expired one: there is no session to recover
  if (response.status === 401 || response.status === 403) {
    tokenStore.set(null);
    return null;
  }
  if (!response.ok) throw await toApiError(response);

  const body = (await response.json().catch(() => null)) as {
    data?: { user?: User; accessToken?: string };
  } | null;
  const user = body?.data?.user;
  const token = body?.data?.accessToken;
  if (!user || !token) throw new ApiError(fallbackMessage(500), 500);

  tokenStore.set(token);
  return { user, accessToken: token };
}

/**
 * Recovers the session from the refresh cookie. Returns null when there is no
 * valid session, and throws on network or server errors (the user may still be
 * signed in; we just couldn't check).
 *
 * Concurrent callers share one request. This matters because the backend rotates
 * the refresh token on every call: a second simultaneous request would use an
 * already-rotated token and be rejected.
 */
export function refreshSession(): Promise<AuthSession | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// ---------------------------------------------------------------------------
// Public request function
// ---------------------------------------------------------------------------

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Protected endpoint: send the access token and refresh once if it has expired. */
  auth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, auth = false }: RequestOptions = {},
): Promise<T> {
  const usedToken = auth ? tokenStore.get() : null;
  let response = await send(path, { method, body, token: usedToken });

  // Only protected requests ever trigger a refresh. A 401 from login means wrong credentials.
  if (response.status === 401 && auth) {
    const latestToken = tokenStore.get();
    let retryToken: string;

    if (latestToken && latestToken !== usedToken) {
      // Another request already refreshed while this one was in flight
      retryToken = latestToken;
    } else {
      // Throws on network/server errors: surface them, the session may still be valid
      const session = await refreshSession();
      if (!session) {
        sessionListener?.(null);
        throw new ApiError(SESSION_EXPIRED_MESSAGE, 401);
      }
      sessionListener?.(session);
      retryToken = session.accessToken;
    }

    // The retry happens exactly once
    response = await send(path, { method, body, token: retryToken });
    if (response.status === 401) {
      sessionListener?.(null);
      throw new ApiError(SESSION_EXPIRED_MESSAGE, 401);
    }
  }

  if (!response.ok) throw await toApiError(response);
  return (await response.json().catch(() => ({}))) as T;
}
