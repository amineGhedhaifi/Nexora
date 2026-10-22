import { useState } from "react";
import { Link, useLocation, NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight, User, LogOut, LayoutDashboard, Package, Tag, ShoppingCart, Mail, Users, X } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { useAdminSidebar } from "@/hooks/useAdminSidebar";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Tag },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Contact Messages", href: "/admin/messages", icon: Mail },
  { name: "Customers", href: "/admin/customers", icon: Users },
] as const;

export function AdminSidebar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useAdminSidebar();

  const handleSignOut = () => {
    signOut();
    setMobileOpen(false);
  };

  if (typeof window === "undefined") return null;

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-card border-r transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0",
        )}
        aria-label="Admin sidebar"
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link to="/admin" className="flex items-center gap-2" aria-label={`${APP_NAME} Admin`}>
            <Logo className="!text-lg" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Main navigation">
          <ul className="space-y-1" role="list">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                (item.href !== "/admin" && location.pathname.startsWith(item.href + "/"));
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className={cn("size-5 shrink-0", isActive && "text-primary-foreground")} aria-hidden="true" />
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {!collapsed && (
            <div className="mt-8 pt-4 border-t">
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account
              </p>
              <ul className="space-y-1" role="list">
                <li>
                  <NavLink
                    to="/admin/profile"
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )
                    }
                    aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className={cn("size-5 shrink-0", ({ isActive }) => (isActive ? "text-primary-foreground" : ""))} aria-hidden="true" />
                    <span>Profile</span>
                  </NavLink>
                </li>
                <li>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    onClick={handleSignOut}
                  >
                    <LogOut className="size-5 shrink-0" aria-hidden="true" />
                    <span>Sign out</span>
                  </Button>
                </li>
              </ul>
            </div>
          )}
        </nav>

        {!collapsed && (
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                <User className="size-5" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name ?? "Admin"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute -right-2 top-1/2 -translate-y-1/2 rounded-full border shadow-lg",
            collapsed ? "xl:block" : "hidden",
          )}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
        </Button>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 xl:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}