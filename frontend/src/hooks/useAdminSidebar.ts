import { useContext } from "react";
import { AdminSidebarContext } from "./AdminSidebarContext";

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error("useAdminSidebar must be used within an AdminSidebarProvider");
  }
  return context;
}