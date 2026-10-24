import { useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  Bell,
  User,
  LogOut,
  Menu,
  Package,
  Mail,
  Volume2,
  VolumeX,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";
import { useAdminSidebar } from "@/hooks/useAdminSidebar";
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications";
import { useNotificationPolling, useNotificationSound } from "@/hooks/useNotificationPolling";
import { formatDistanceToNow } from "date-fns";

interface AdminHeaderProps {
  children?: ReactNode;
}

function NotificationIcon({ type }: { type: "NEW_ORDER" | "NEW_MESSAGE" }) {
  if (type === "NEW_ORDER") {
    return <Package className="size-4 text-primary" aria-hidden="true" />;
  }
  return <Mail className="size-4 text-blue-500" aria-hidden="true" />;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  isMarkingAsRead,
}: {
  notification: {
    id: string;
    type: "NEW_ORDER" | "NEW_MESSAGE";
    message: string;
    isRead: boolean;
    createdAt: string;
  };
  onMarkAsRead: (id: string) => void;
  isMarkingAsRead: boolean;
}) {
  return (
    <button
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
      className={cn(
        "w-full flex items-start gap-3 p-3 text-left transition-colors",
        notification.isRead
          ? "bg-transparent hover:bg-accent/50"
          : "bg-accent/50 hover:bg-accent",
      )}
      role="menuitem"
      aria-label={notification.isRead ? "Mark as unread" : "Mark as read"}
      disabled={isMarkingAsRead}
    >
      <div className="flex-shrink-0 mt-0.5">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm", notification.isRead ? "text-muted-foreground" : "font-medium text-foreground")}>
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!notification.isRead && (
        <div className="flex-shrink-0 size-2 rounded-full bg-primary" aria-hidden="true" />
      )}
    </button>
  );
}

export function AdminHeader({ children }: AdminHeaderProps) {
  const location = useLocation();
  const { user, signOut, isAuthenticated, isLoading: authLoading } = useAuth();
  const { setMobileOpen } = useAdminSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: notifications, isLoading: notificationsLoading, error: notificationsError, refetch: refetchNotifications } = useNotifications();
  const { data: unreadCount = 0, isLoading: unreadCountLoading } = useUnreadCount();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const { soundEnabled, setSoundEnabled } = useNotificationSound();

  useNotificationPolling(isAuthenticated, () => {
    refetchNotifications();
  });

  const handleSignOut = () => {
    signOut();
    setProfileOpen(false);
  };

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleToggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
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

  if (authLoading) {
    return (
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center justify-between gap-4 page-container">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="h-8 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </header>
    );
  }

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
              onClick={handleToggleNotifications}
              aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
              aria-expanded={notificationsOpen}
            >
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold leading-5 text-primary-foreground">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>

            {notificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-xl border bg-card shadow-lg py-2"
                role="menu"
                aria-label="Notifications"
              >
                <div className="px-4 py-2 border-b flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      disabled={markAllAsReadMutation.isPending}
                      className="text-xs"
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {(notificationsLoading || unreadCountLoading) && (
                    <div className="px-4 py-3 space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex-shrink-0 size-8 rounded-lg animate-pulse bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 animate-pulse bg-muted rounded" />
                            <div className="h-3 w-1/2 animate-pulse bg-muted rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {notificationsError && (
                    <div className="px-4 py-3 text-center text-sm text-destructive flex items-center justify-center gap-2">
                      <AlertCircle className="size-4" aria-hidden="true" />
                      <span>Failed to load notifications</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refetchNotifications()}
                        className="h-8 px-2"
                      >
                        Retry
                      </Button>
                    </div>
                  )}

                  {!notificationsLoading && !notificationsError && notifications && notifications.length === 0 && (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No notifications yet
                    </div>
                  )}

                  {!notificationsLoading && !notificationsError && notifications && notifications.length > 0 && (
                    <div className="divide-y">
                      {notifications.slice(0, 10).map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          isMarkingAsRead={markAsReadMutation.isPending && markAsReadMutation.variables === notification.id}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t p-3">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm text-muted-foreground">Sound</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-8"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      aria-label={soundEnabled ? "Disable notification sound" : "Enable notification sound"}
                      aria-pressed={soundEnabled}
                    >
                      {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                    </Button>
                  </div>
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