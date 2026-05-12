import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/../auth";

export async function getAdminSession() {
  return getServerSession(authOptions);
}

export async function requireTenantAdmin(store: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/${store}/admin/login`);
  }

  if (session.user.tenantSlug !== store) {
    redirect(`/${store}/admin/login`);
  }

  return session;
}

export async function requireTenantAdminApi(store: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      ok: false as const,
      status: 401,
      error: "No autenticado",
      session: null,
    };
  }

  if (session.user.tenantSlug !== store) {
    return {
      ok: false as const,
      status: 403,
      error: "No autorizado para esta tienda",
      session: null,
    };
  }

  return {
    ok: true as const,
    status: 200,
    error: null,
    session,
  };
}