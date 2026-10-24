import { useState, useEffect, type ReactNode } from "react";
import { AdminSidebarContext } from "./AdminSidebarContext";

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapsed = () => setCollapsed((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  return (
    <AdminSidebarContext.Provider
      value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen, toggleCollapsed, closeMobile }}
    >
      {children}
    </AdminSidebarContext.Provider>
  );
}