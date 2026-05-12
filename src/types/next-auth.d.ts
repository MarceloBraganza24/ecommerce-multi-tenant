import { DefaultSession } from "next-auth";

type AdminRole = "super_admin" | "tenant_admin";

declare module "next-auth" {
  interface User {
    id: string;
    tenantId: string;
    tenantSlug: string;
    role: AdminRole;
  }

  interface Session {
    user: {
      id: string;
      tenantId: string;
      tenantSlug: string;
      role: AdminRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tenantId: string;
    tenantSlug: string;
    role: AdminRole;
  }
}