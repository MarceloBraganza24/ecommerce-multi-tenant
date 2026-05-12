import { requireTenantAdmin } from "@/lib/adminAuth";
import { updateTenantSettingsAction } from "../actions";
import { Tenant } from "@/models/Tenant";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function AdminSettingsPage({ params }: Props) {
  const { store } = await params;

  await requireTenantAdmin(store);

  const tenant = await Tenant.findOne({ slug: store }).lean();

  if (!tenant) {
    notFound();
  }

  const safeTenant = JSON.parse(JSON.stringify(tenant));

  return (
    <div>
      <div className="adminHeader">
        <div>
          <span className="eyebrow">Configuración</span>
          <h1>Datos de la tienda</h1>
        </div>
      </div>

      <form
        className="adminForm"
        action={updateTenantSettingsAction.bind(null, store)}
      >
        <label>
          Nombre tienda
          <input name="name" defaultValue={safeTenant.name} />
        </label>

        <label>
          Logo texto
          <input name="logoText" defaultValue={safeTenant.logoText} />
        </label>

        <label>
          WhatsApp
          <input name="whatsapp" defaultValue={safeTenant.whatsapp} />
        </label>

        <label>
          Color principal
          <input name="primaryColor" type="color" defaultValue={safeTenant.primaryColor} />
        </label>

        <label>
          Envío gratis desde
          <input
            name="freeShippingFrom"
            type="number"
            defaultValue={safeTenant.freeShippingFrom}
          />
        </label>

        <label>
          Título hero
          <input name="heroTitle" defaultValue={safeTenant.heroTitle || ""} />
        </label>

        <label>
          Subtítulo hero
          <textarea name="heroSubtitle" defaultValue={safeTenant.heroSubtitle || ""} />
        </label>

        <label>
          Imagen hero
          <input name="heroImage" defaultValue={safeTenant.heroImage || ""} />
        </label>

        <label>
          Texto banner
          <input name="bannerText" defaultValue={safeTenant.bannerText || ""} />
        </label>

        <label>
          Instagram
          <input name="instagram" defaultValue={safeTenant.social?.instagram || ""} />
        </label>

        <label>
          Facebook
          <input name="facebook" defaultValue={safeTenant.social?.facebook || ""} />
        </label>

        <label>
          Mercado Pago Access Token
          <input
            name="mpAccessToken"
            type="password"
            defaultValue={safeTenant.mpAccessToken || ""}
          />
        </label>

        <button className="adminPrimaryButton" type="submit">
          Guardar configuración
        </button>
      </form>
    </div>
  );
}