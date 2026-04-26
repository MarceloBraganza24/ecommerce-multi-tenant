import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";

export function getAdminCookieName(store: string) {
  return `admin_${store}`;
}

export async function requireAdmin(store: string) {
  const tenant = await getTenantBySlug(store);

  if (!tenant) {
    redirect(`/${store}`);
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(getAdminCookieName(store))?.value;

  if (!cookieValue || cookieValue !== tenant.adminKey) {
    redirect(`/${store}/admin/login`);
  }

  return tenant;
}