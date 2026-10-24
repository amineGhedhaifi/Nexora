import { createContext } from "react";

interface AdminSidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleCollapsed: () => void;
  closeMobile: () => void;
}

export const AdminSidebarContext = createContext<AdminSidebarContextType | null>(null);