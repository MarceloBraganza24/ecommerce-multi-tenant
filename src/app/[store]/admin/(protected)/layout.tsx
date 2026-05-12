import type { ReactNode } from "react";
import { requireTenantAdmin } from "@/lib/adminAuth";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { notFound } from "next/navigation";

type Props = {
  children: ReactNode;
  params: Promise<{ store: string }>;
};

export default async function AdminLayout({
  children,
  params,
}: Props) {
  const { store } = await params;

  await requireTenantAdmin(store);

  await connectDB();

  const tenant = await Tenant.findOne({ slug: store }).lean();

  if (!tenant) {
    notFound();
  }

  const safeTenant = JSON.parse(JSON.stringify(tenant));

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <div className="hidden lg:block">
        <AdminSidebar
          store={store}
          storeName={safeTenant.name}
        />
      </div>

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  );
}