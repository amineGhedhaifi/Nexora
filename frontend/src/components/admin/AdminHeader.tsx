import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, ChevronDown, Bell, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";
import { useAdminSidebar } from "@/hooks/useAdminSidebar";

interface AdminHeaderProps {
  children?: ReactNode;
}

export function AdminHeader({ children }: AdminHeaderProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { mobileOpen, setMobileOpen, closeMobile } = useAdminSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    setProfileOpen(false);
  };

  const breadcrumbs = location.pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => segment !== "admin")
    .map((segment, index, array) => {
      const href = "/admin/" + array.slice(0, index + 1).join("/");
      let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
      if (/^[A-Z]{2,}-\d+$/.test(segment)) {
        label = `Order ${segment}`;
      }
      return { href, label, isLast: index === array.length - 1 };
    });

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 items-center justify-between gap-4 page-container">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>

          <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-sm">
            <Link
              to="/admin"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            {breadcrumbs.map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-2">
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                {crumb.isLast ? (
                  <span className="font-medium text-foreground">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {children}

          <ThemeToggle className="xl:hidden" />
          <ThemeToggle className="hidden xl:inline-flex" />

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              aria-label="Notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell className="size-5" />
              <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold leading-5 text-primary-foreground">
                3
              </span>
            </Button>

            {notificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-xl border bg-card shadow-lg py-2"
                role="menu"
                aria-label="Notifications"
              >
                <div className="px-4 py-2 border-b">
                  <h3 className="font-semibold">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                </div>
                <div className="border-t p-4">
                  <Button variant="ghost" className="w-full" size="sm">
                    View all notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              aria-label="User menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
                <User className="size-4" aria-hidden="true" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium truncate max-w-[160px]">{user?.name ?? "Admin"}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[160px]">{user?.email}</p>
              </div>
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
            </Button>

            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-xl border bg-card shadow-lg py-2"
                role="menu"
                aria-label="User menu"
              >
                <div className="px-4 py-3 border-b">
                  <p className="font-medium">{user?.name ?? "Admin"}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Link
                  to="/admin/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  role="menuitem"
                  onClick={() => setProfileOpen(false)}
                >
                  <User className="size-4" aria-hidden="true" />
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent hover:text-destructive"
                  onClick={handleSignOut}
                  role="menuitem"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}