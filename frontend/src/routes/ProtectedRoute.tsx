import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageSpinner } from "@/components/shared/PageSpinner";
import { useAuth } from "@/hooks/useAuth";

/**
 * Wrap pages that need a signed-in user:
 *   { element: <ProtectedRoute />, children: [{ path: "account", Component: Account }] }
 * This is for user experience only. The API must enforce access on every endpoint.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait for the session check: otherwise a refresh would bounce signed-in users to /login
  if (isLoading) return <PageSpinner label="Checking your session" />;

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  return <Outlet />;
}
