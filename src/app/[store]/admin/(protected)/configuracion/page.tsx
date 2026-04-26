import { requireTenantAdmin } from "@/lib/admin-session";
import { updateTenantSettingsAction } from "../actions";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function AdminSettingsPage({ params }: Props) {
  const { store } = await params;
  const { tenant } = await requireTenantAdmin(store);

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
          <input name="name" defaultValue={tenant.name} />
        </label>

        <label>
          Logo texto
          <input name="logoText" defaultValue={tenant.logoText} />
        </label>

        <label>
          WhatsApp
          <input name="whatsapp" defaultValue={tenant.whatsapp} />
        </label>

        <label>
          Color principal
          <input name="primaryColor" type="color" defaultValue={tenant.primaryColor} />
        </label>

        <label>
          Envío gratis desde
          <input
            name="freeShippingFrom"
            type="number"
            defaultValue={tenant.freeShippingFrom}
          />
        </label>

        <label>
          Título hero
          <input name="heroTitle" defaultValue={tenant.heroTitle || ""} />
        </label>

        <label>
          Subtítulo hero
          <textarea name="heroSubtitle" defaultValue={tenant.heroSubtitle || ""} />
        </label>

        <label>
          Imagen hero
          <input name="heroImage" defaultValue={tenant.heroImage || ""} />
        </label>

        <label>
          Texto banner
          <input name="bannerText" defaultValue={tenant.bannerText || ""} />
        </label>

        <label>
          Instagram
          <input name="instagram" defaultValue={tenant.social?.instagram || ""} />
        </label>

        <label>
          Facebook
          <input name="facebook" defaultValue={tenant.social?.facebook || ""} />
        </label>

        <label>
          Mercado Pago Access Token
          <input
            name="mpAccessToken"
            type="password"
            defaultValue={tenant.mpAccessToken || ""}
          />
        </label>

        <button className="adminPrimaryButton" type="submit">
          Guardar configuración
        </button>
      </form>
    </div>
  );
}