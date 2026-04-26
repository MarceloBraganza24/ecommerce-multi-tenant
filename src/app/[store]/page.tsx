import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";
import { getProductsByTenantId } from "@/lib/products";
import { getCategoriesByTenantId } from "@/lib/categories";
import { ProductSlider } from "@/components/store/ProductSlider";
import { CategoryCards } from "@/components/store/CategoryCards";
import { BrandTabs } from "@/components/store/BrandTabs";
import { MongoCategory, MongoProduct } from "@/types/store";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function HomePage({ params }: Props) {
  const { store } = await params;
  const tenant = await getTenantBySlug(store);

  if (!tenant) notFound();
  
  const tenantProducts = (await getProductsByTenantId(tenant._id)) as MongoProduct[];
  const allCategories = (await getCategoriesByTenantId(tenant._id)) as MongoCategory[];

  const offerProducts = tenantProducts.filter((product) => product.offer);
  const featuredProducts = tenantProducts.filter((product) => product.featured);
  const mainCategories = allCategories.filter((category) => !category.parentId);

  return (
    <div className="storePage">
      <section className="heroSection">
        <div>
          <span className="eyebrow">Tienda online</span>
          <h1>Comprá fácil, rápido y seguro en {tenant.name}</h1>
          <p>
            Productos seleccionados, promociones especiales y atención
            personalizada por WhatsApp.
          </p>

          <div className="heroActions">
            <a href={`/${store}/productos`} className="primaryButton">
              Ver productos
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

      <ProductSlider title="Ofertas destacadas" products={offerProducts} store={store} />

      <CategoryCards categories={mainCategories} store={store} />

      <BrandTabs products={tenantProducts} store={store} />

      <ProductSlider
        title="Productos destacados"
        products={featuredProducts}
        store={store}
      />
    </div>
  );
}