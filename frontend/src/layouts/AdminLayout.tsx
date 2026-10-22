import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebarProvider, useAdminSidebar } from "@/hooks/useAdminSidebar";

function AdminLayoutContent() {
  const { collapsed } = useAdminSidebar();

  return (
    <div className="flex min-h-dvh bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col transition-all duration-300 min-w-0 xl:ml-[var(--sidebar-width)]" style={{ '--sidebar-width': collapsed ? '4rem' : '16rem' } as React.CSSProperties}>
        <AdminHeader />
        <main className="flex-1 p-6 xl:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminSidebarProvider>
      <AdminLayoutContent />
    </AdminSidebarProvider>
  );
}