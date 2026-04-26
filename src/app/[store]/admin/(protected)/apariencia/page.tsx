import { requireTenantAdmin } from "@/lib/admin-session";
import { updateAppearanceAction } from "../actions";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function AdminAppearancePage({ params }: Props) {
  const { store } = await params;
  const { tenant } = await requireTenantAdmin(store);

  const appearance = tenant.appearance || {};

  return (
    <div>
      <div className="adminHeader">
        <div>
          <span className="eyebrow">Apariencia</span>
          <h1>Personalizar tienda</h1>
          <p>Colores, logo, hero, banners, tipografía y mensajes promocionales.</p>
        </div>

        <a className="adminPrimaryButton" href={`/${store}`} target="_blank">
          Ver tienda
        </a>
      </div>

      <section className="appearanceGrid">
        <form
          className="adminForm appearanceForm"
          action={updateAppearanceAction.bind(null, store)}
        >
          <h2>Marca</h2>

          <ImageUploader
            name="logoImage"
            label="Logo"
            defaultValue={appearance.logoImage || ""}
          />

          <ImageUploader
            name="favicon"
            label="Favicon"
            defaultValue={appearance.favicon || ""}
          />

          <h2>Colores</h2>

          <div className="adminTwoColumns">
            <label>
              Color principal
              <input
                name="primaryColor"
                type="color"
                defaultValue={
                  appearance.primaryColor || tenant.primaryColor || "#111827"
                }
              />
            </label>

            <label>
              Color secundario
              <input
                name="secondaryColor"
                type="color"
                defaultValue={appearance.secondaryColor || "#f59e0b"}
              />
            </label>

            <label>
              Fondo
              <input
                name="backgroundColor"
                type="color"
                defaultValue={appearance.backgroundColor || "#ffffff"}
              />
            </label>

            <label>
              Texto
              <input
                name="textColor"
                type="color"
                defaultValue={appearance.textColor || "#111827"}
              />
            </label>
          </div>

          <h2>Estilo visual</h2>

          <div className="adminTwoColumns">
            <label>
              Bordes de botones
              <select
                name="buttonRadius"
                defaultValue={appearance.buttonRadius || "soft"}
              >
                <option value="square">Recto</option>
                <option value="soft">Suave</option>
                <option value="pill">Redondeado</option>
              </select>
            </label>

            <label>
              Tipografía
              <select
                name="fontStyle"
                defaultValue={appearance.fontStyle || "modern"}
              >
                <option value="modern">Moderna</option>
                <option value="elegant">Elegante</option>
                <option value="classic">Clásica</option>
              </select>
            </label>

            <label>
              Layout
              <select
                name="layoutStyle"
                defaultValue={appearance.layoutStyle || "minimal"}
              >
                <option value="minimal">Minimal</option>
                <option value="sport">Sport</option>
                <option value="premium">Premium</option>
              </select>
            </label>
          </div>

          <h2>Cinta promocional</h2>

          <label className="adminInlineCheckbox">
            <input
              name="promoBarEnabled"
              type="checkbox"
              defaultChecked={appearance.promoBarEnabled !== false}
            />
            Mostrar cinta promocional
          </label>

          <label>
            Mensajes de cinta, uno por línea
            <textarea
              name="promoMessages"
              defaultValue={(appearance.promoMessages || [
                "Envío gratis en compras seleccionadas",
                "Pagá seguro",
                "Cambios simples",
              ]).join("\n")}
            />
          </label>

          <h2>Hero principal</h2>

          <label>
            Título hero
            <input
              name="heroTitle"
              defaultValue={appearance.heroTitle || tenant.heroTitle || ""}
            />
          </label>

          <label>
            Subtítulo hero
            <textarea
              name="heroSubtitle"
              defaultValue={
                appearance.heroSubtitle || tenant.heroSubtitle || ""
              }
            />
          </label>

          <ImageUploader
            name="heroImage"
            label="Imagen hero"
            defaultValue={appearance.heroImage || tenant.heroImage || ""}
          />

          <label>
            Texto del botón
            <input
              name="heroCtaText"
              defaultValue={appearance.heroCtaText || "Ver productos"}
            />
          </label>

          <h2>Banner secundario</h2>

          <label>
            Título banner
            <input
              name="bannerTitle"
              defaultValue={appearance.bannerTitle || ""}
            />
          </label>

          <label>
            Subtítulo banner
            <textarea
              name="bannerSubtitle"
              defaultValue={appearance.bannerSubtitle || ""}
            />
          </label>

          <ImageUploader
            name="bannerImage"
            label="Imagen banner"
            defaultValue={appearance.bannerImage || ""}
          />

          <button className="adminPrimaryButton" type="submit">
            Guardar apariencia
          </button>
        </form>

        <aside className="appearancePreview">
          <div
            className={`previewCard preview-${appearance.layoutStyle || "minimal"}`}
            style={
              {
                "--preview-primary":
                  appearance.primaryColor || tenant.primaryColor || "#111827",
                "--preview-secondary":
                  appearance.secondaryColor || "#f59e0b",
                "--preview-bg": appearance.backgroundColor || "#ffffff",
                "--preview-text": appearance.textColor || "#111827",
                "--preview-radius":
                  appearance.buttonRadius === "pill"
                    ? "999px"
                    : appearance.buttonRadius === "square"
                    ? "0px"
                    : "16px",
              } as React.CSSProperties
            }
          >
            <div className="previewPromo">
              {(appearance.promoMessages?.[0] ||
                "Envío gratis en compras seleccionadas")}
            </div>

            <div className="previewNav">
              <strong>
                {appearance.logoImage ? (
                  <img src={appearance.logoImage} alt="Logo" />
                ) : (
                  tenant.logoText
                )}
              </strong>
              <span>☰ 🛒</span>
            </div>

            <div className="previewHero">
              <div>
                <small>Nueva colección</small>
                <h3>{appearance.heroTitle || tenant.heroTitle || "Tu tienda online"}</h3>
                <p>
                  {appearance.heroSubtitle ||
                    tenant.heroSubtitle ||
                    "Personalizá la experiencia de compra de tu marca."}
                </p>
                <button>{appearance.heroCtaText || "Ver productos"}</button>
              </div>

              {appearance.heroImage && (
                <img src={appearance.heroImage} alt="Hero preview" />
              )}
            </div>

            <div className="previewProducts">
              <article />
              <article />
              <article />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}