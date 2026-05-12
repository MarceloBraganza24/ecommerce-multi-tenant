import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";
import { getProductsByTenantId } from "@/lib/products";
import { getCategoriesByTenantId } from "@/lib/categories";
import { ProductSlider } from "@/components/store/ProductSlider";
import { CategoryCards } from "@/components/store/CategoryCards";
import { BrandTabs } from "@/components/store/BrandTabs";
import { MongoCategory, MongoProduct } from "@/types/store";
import { defaultHomeSections } from "@/lib/builder/defaultHomeSections";
import { HomeBuilderRenderer } from "@/components/storefront/HomeBuilderRenderer";
import { defaultFooter } from "@/lib/builder/defaultFooter";
import { BuilderFooter } from "@/components/storefront/BuilderFooter";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function HomePage({ params }: Props) {
  const { store } = await params;

  const tenant = await getTenantBySlug(store);

  if (!tenant) notFound();

  const tenantProducts = (await getProductsByTenantId(
    tenant._id
  )) as MongoProduct[];

  const allCategories = (await getCategoriesByTenantId(
    tenant._id
  )) as MongoCategory[];

  const offerProducts = tenantProducts.filter((product) => product.offer);
  const featuredProducts = tenantProducts.filter((product) => product.featured);
  const mainCategories = allCategories.filter((category) => !category.parentId);

  const hasCustomHomeBuilder =
    tenant.builder?.homeSections && tenant.builder.homeSections.length > 0;

  const homeSections = hasCustomHomeBuilder
    ? JSON.parse(JSON.stringify(tenant.builder.homeSections))
    : defaultHomeSections;

  const footer = tenant.builder?.footer
    ? JSON.parse(JSON.stringify(tenant.builder.footer))
    : defaultFooter;

  return (
    <div className="storePage">
      {hasCustomHomeBuilder ? (
        <HomeBuilderRenderer sections={homeSections} />
      ) : (
        <>
          <section className="heroSection">
            <div>
              <span className="eyebrow">Tienda online</span>

              <h1>
                {tenant.appearance?.heroTitle ||
                  tenant.heroTitle ||
                  `Comprá fácil, rápido y seguro en ${tenant.name}`}
              </h1>

              <p>
                {tenant.appearance?.heroSubtitle ||
                  tenant.heroSubtitle ||
                  "Productos seleccionados, promociones especiales y atención personalizada por WhatsApp."}
              </p>

              <div className="heroActions">
                <a href={`/${store}/productos`} className="primaryButton">
                  {tenant.appearance?.heroCtaText || "Ver productos"}
                </a>

                <a href={`/${store}/contacto`} className="secondaryButton">
                  Consultar
                </a>
              </div>
            </div>
          </section>

          <section className="logoStrip">
            <span>Mercado Pago</span>
            <span>Envíos a todo el país</span>
            <span>Compra segura</span>
            <span>Soporte por WhatsApp</span>
          </section>

          {offerProducts.length > 0 && (
            <ProductSlider
              title="Ofertas destacadas"
              products={offerProducts}
              store={store}
            />
          )}

          {mainCategories.length > 0 && (
            <CategoryCards categories={mainCategories} store={store} />
          )}

          {tenantProducts.length > 0 && (
            <BrandTabs products={tenantProducts} store={store} />
          )}

          {featuredProducts.length > 0 && (
            <ProductSlider
              title="Productos destacados"
              products={featuredProducts}
              store={store}
            />
          )}

          <BuilderFooter footer={footer} store={store} storeName={tenant.name} />
        </>
      )}
    </div>
  );
}