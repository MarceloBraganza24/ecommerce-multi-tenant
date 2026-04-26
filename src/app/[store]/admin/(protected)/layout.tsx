import type { ReactNode } from "react";
import { requireTenantAdmin } from "@/lib/admin-session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

type Props = {
  children: ReactNode;
  params: Promise<{ store: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { store } = await params;
  const { tenant } = await requireTenantAdmin(store);
  
  return (
    <div className="adminShell">
      <AdminSidebar store={store} tenantName={tenant.name} />
      <main className="adminMain">{children}</main>
    </div>
  );
}