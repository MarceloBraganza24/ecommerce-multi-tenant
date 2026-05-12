import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { AdminUser } from "@/models/AdminUser";
import { verifyPassword } from "@/lib/password";

export default function SuperAdminLoginPage() {
  async function loginAction(formData: FormData) {
    "use server";

    await connectDB();

    const email = String(formData.get("email") || "")
      .toLowerCase()
      .trim();

    const password = String(formData.get("password") || "");

    const user = await AdminUser.findOne({
      email,
      role: "super_admin",
      active: true,
    }).select("+passwordHash");

    if (!user) {
      redirect("/admin-global/login?error=1");
    }

    const validPassword = await verifyPassword(
      password,
      String(user.passwordHash)
    );

    if (!validPassword) {
      redirect("/admin-global/login?error=1");
    }

    const cookieStore = await cookies();

    cookieStore.set("super_admin", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
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