import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { AdminUser } from "@/models/AdminUser";
import { getTenantBySlug } from "@/lib/tenants";

const COOKIE_NAME = "mt_admin_session";

type AdminSessionPayload = {
  userId: string;
  role: "super_admin" | "tenant_admin";
  tenantId?: string | null;
  email: string;
  exp: number;
};

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("Falta ADMIN_SESSION_SECRET o JWT_SECRET");
  }

  return secret;
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("hex");
}

function encodeSession(payload: AdminSessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(body);

  return `${body}.${signature}`;
}

function decodeSession(token?: string): AdminSessionPayload | null {
  if (!token) return null;

  const [body, signature] = token.split(".");

  if (!body || !signature) return null;
  if (sign(body) !== signature) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as AdminSessionPayload;

    if (payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function createAdminSession(payload: Omit<AdminSessionPayload, "exp">) {
  const cookieStore = await cookies();

  const token = encodeSession({
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(COOKIE_NAME)?.value);
}

export async function requireTenantAdmin(store: string) {
  await connectDB();

  const session = await getAdminSession();

  if (!session) {
    redirect(`/${store}/admin/login`);
  }

  const tenant = await getTenantBySlug(store);

  if (!tenant) {
    redirect("/");
  }

  const isSuperAdmin = session.role === "super_admin";
  const isTenantAdmin =
    session.role === "tenant_admin" &&
    String(session.tenantId) === String(tenant._id);

  if (!isSuperAdmin && !isTenantAdmin) {
    redirect(`/${store}/admin/login`);
  }

  const user = await AdminUser.findOne({
    _id: session.userId,
    active: true,
  }).lean();

  if (!user) {
    redirect(`/${store}/admin/login`);
  }

  return { tenant, session };
}

export async function requireSuperAdmin() {
  await connectDB();

  const session = await getAdminSession();

  if (!session || session.role !== "super_admin") {
    redirect("/admin-global/login");
  }

  const user = await AdminUser.findOne({
    _id: session.userId,
    role: "super_admin",
    active: true,
  }).lean();

  if (!user) {
    redirect("/admin-global/login");
  }

  return session;
}