import { Navigate } from "react-router-dom";
import { PageSpinner } from "@/components/shared/PageSpinner";
import { useAuth } from "@/hooks/useAuth";

/**
 * Wrap client/store pages. Prevents admins from accessing client pages.
 * Redirects admins to the admin dashboard.
 * Guests (unauthenticated users) are allowed access.
 */
export function ClientRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <PageSpinner label="Checking your session" />;

  if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;

  return <>{children}</>;
}