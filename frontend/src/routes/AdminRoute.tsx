import { Navigate, useLocation } from "react-router-dom";
import { PageSpinner } from "@/components/shared/PageSpinner";
import { useAuth } from "@/hooks/useAuth";

/**
 * Wrap admin pages. Hiding them here is a courtesy: every admin API endpoint
 * must check the ADMIN role again on the server (authenticate + authorize).
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

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

  if (user?.role !== "ADMIN") return <Navigate to="/" replace />;

  return <>{children}</>;
}
