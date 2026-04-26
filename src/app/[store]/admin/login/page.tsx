import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { getTenantBySlug } from "@/lib/tenants";
import { AdminUser } from "@/models/AdminUser";
import { verifyPassword } from "@/lib/password";
import { createAdminSession } from "@/lib/admin-session";

type Props = {
  params: Promise<{ store: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ params, searchParams }: Props) {
  const { store } = await params;
  const { error } = await searchParams;

  async function loginAction(formData: FormData) {
    "use server";

    await connectDB();

    const tenant = await getTenantBySlug(store);
    if (!tenant) redirect(`/${store}/admin/login?error=1`);

    const email = String(formData.get("email") || "").toLowerCase().trim();
    const password = String(formData.get("password") || "");

    const user = await AdminUser.findOne({
      email,
      active: true,
      $or: [
        { role: "super_admin" },
        { role: "tenant_admin", tenantId: tenant._id },
      ],
    }).lean();

    if (!user || !verifyPassword(password, String(user.passwordHash))) {
      redirect(`/${store}/admin/login?error=1`);
    }

    await createAdminSession({
      userId: String(user._id),
      role: user.role as "super_admin" | "tenant_admin",
      tenantId: user.tenantId ? String(user.tenantId) : null,
      email,
    });

    redirect(`/${store}/admin`);
  }

  return (
    <div className="adminLoginPage">
      <form action={loginAction} className="adminLoginCard">
        <span className="eyebrow">Admin</span>
        <h1>Ingresar al panel</h1>

        {error && <p className="adminError">Datos incorrectos</p>}

        <label>
          Email
          <input name="email" type="email" required />
        </label>

        <label>
          Contraseña
          <input name="password" type="password" required />
        </label>

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}