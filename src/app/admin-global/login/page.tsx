import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { AdminUser } from "@/models/AdminUser";
import { verifyPassword } from "@/lib/password";
import { createAdminSession } from "@/lib/admin-session";

export default function SuperAdminLoginPage() {
  async function loginAction(formData: FormData) {
    "use server";

    await connectDB();

    const email = String(formData.get("email") || "").toLowerCase().trim();
    const password = String(formData.get("password") || "");

    const user = await AdminUser.findOne({
      email,
      role: "super_admin",
      active: true,
    }).lean();

    if (!user || !verifyPassword(password, String(user.passwordHash))) {
      redirect("/admin-global/login?error=1");
    }

    await createAdminSession({
      userId: String(user._id),
      role: "super_admin",
      tenantId: null,
      email,
    });

    redirect("/admin-global");
  }

  return (
    <div className="adminLoginPage">
      <form action={loginAction} className="adminLoginCard">
        <span className="eyebrow">Super Admin</span>
        <h1>Ingresar</h1>

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