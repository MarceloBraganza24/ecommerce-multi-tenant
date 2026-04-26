import { redirect } from "next/navigation";
import { Tenant } from "@/models/Tenant";
import { AdminUser } from "@/models/AdminUser";
import { connectDB } from "@/lib/mongodb";
import { requireSuperAdmin } from "@/lib/admin-session";
import { hashPassword } from "@/lib/password";

export default async function SuperAdminPage() {
  await requireSuperAdmin();
  await connectDB();

  const tenants = await Tenant.find().sort({ createdAt: -1 }).lean();

  async function createTenantAction(formData: FormData) {
    "use server";

    await requireSuperAdmin();
    await connectDB();

    const slug = String(formData.get("slug") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").toLowerCase().trim();
    const password = String(formData.get("password") || "");

    const tenant = await Tenant.create({
      slug,
      name,
      logoText: String(formData.get("logoText") || name),
      whatsapp: String(formData.get("whatsapp") || ""),
      primaryColor: String(formData.get("primaryColor") || "#111827"),
      freeShippingFrom: Number(formData.get("freeShippingFrom") || 0),
      mpAccessToken: String(formData.get("mpAccessToken") || ""),
      heroTitle: String(formData.get("heroTitle") || ""),
      heroSubtitle: String(formData.get("heroSubtitle") || ""),
      heroImage: String(formData.get("heroImage") || ""),
      bannerText: String(formData.get("bannerText") || ""),
      active: true,
    });

    await AdminUser.create({
      tenantId: tenant._id,
      role: "tenant_admin",
      email,
      name,
      passwordHash: hashPassword(password),
      active: true,
    });

    redirect("/admin-global");
  }

  return (
    <div className="adminMain">
      <div className="adminHeader">
        <div>
          <span className="eyebrow">Super Admin</span>
          <h1>Crear tiendas</h1>
        </div>
      </div>

      <form className="adminForm" action={createTenantAction}>
        <label>
          Slug
          <input name="slug" placeholder="mi-tienda" required />
        </label>

        <label>
          Nombre
          <input name="name" required />
        </label>

        <label>
          Logo texto
          <input name="logoText" />
        </label>

        <label>
          WhatsApp
          <input name="whatsapp" />
        </label>

        <label>
          Color principal
          <input name="primaryColor" type="color" defaultValue="#111827" />
        </label>

        <label>
          Envío gratis desde
          <input name="freeShippingFrom" type="number" defaultValue={0} />
        </label>

        <label>
          Mercado Pago Access Token
          <input name="mpAccessToken" />
        </label>

        <label>
          Hero título
          <input name="heroTitle" />
        </label>

        <label>
          Hero subtítulo
          <textarea name="heroSubtitle" />
        </label>

        <label>
          Hero imagen
          <input name="heroImage" />
        </label>

        <label>
          Banner
          <input name="bannerText" />
        </label>

        <label>
          Email dueño
          <input name="email" type="email" required />
        </label>

        <label>
          Contraseña dueño
          <input name="password" type="password" required />
        </label>

        <button className="adminPrimaryButton" type="submit">
          Crear tienda
        </button>
      </form>

      <section className="adminTableCard analyticsCard">
        <h2>Tiendas</h2>

        <table>
          <thead>
            <tr>
              <th>Tienda</th>
              <th>Slug</th>
              <th>Activa</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {tenants.map((tenant) => (
              <tr key={String(tenant._id)}>
                <td>{String(tenant.name)}</td>
                <td>{String(tenant.slug)}</td>
                <td>{tenant.active ? "Sí" : "No"}</td>
                <td>
                  <a href={`/${tenant.slug}/admin`} target="_blank">
                    Abrir admin
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}