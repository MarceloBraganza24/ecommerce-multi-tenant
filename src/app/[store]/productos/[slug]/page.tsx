import Image from "next/image";
import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";
import { getProductBySlug, getProductsByTenantId } from "@/lib/products";
import { getCategoriesByTenantId } from "@/lib/categories";
import { getCategoryPathBySlug } from "@/lib/category-path";
import { ProductSlider } from "@/components/store/ProductSlider";
import { ProductVariantSelector } from "@/components/store/ProductVariantSelector";
import { Breadcrumbs } from "@/components/store/Breadcrumbs";
import type { MongoCategory, MongoProduct } from "@/types/store";
import { ProductViewTracker } from "@/components/store/ProductViewTracker";

type Props = {
  params: Promise<{
    store: string;
    slug: string;
  }>;
};

export default async function ProductDetailPage({ params }: Props) {
  const { store, slug } = await params;

  const tenant = await getTenantBySlug(store);
  if (!tenant) notFound();

  const product = (await getProductBySlug(
    tenant._id,
    slug
  )) as MongoProduct | null;

  if (!product) notFound();

  const allProducts = (await getProductsByTenantId(
    tenant._id
  )) as MongoProduct[];

  const allCategories = (await getCategoriesByTenantId(
    tenant._id
  )) as MongoCategory[];

  const categoryPath = getCategoryPathBySlug(
    allCategories,
    product.categorySlug
  );

  const breadcrumbItems = [
    {
      label: "Inicio",
      href: `/${store}`,
    },
    {
      label: "Productos",
      href: `/${store}/productos`,
    },
    ...categoryPath.map((category) => ({
      label: category.name,
      href: `/${store}/productos?categoria=${category.slug}`,
    })),
    {
      label: product.title,
    },
  ];

  const relatedProducts = allProducts
    .filter((item) => {
      if (String(item._id) === String(product._id)) return false;

      const sameCategory = item.categorySlug === product.categorySlug;

      const sameSport =
        item.properties?.deporte &&
        item.properties?.deporte === product.properties?.deporte;

      const sameBrand = item.brand && item.brand === product.brand;

      return Boolean(sameCategory || sameSport || sameBrand);
    })
    .slice(0, 8);

  return (
    <div className="innerPage">
      <ProductViewTracker
        tenantSlug={store}
        productId={String(product._id)}
        productSlug={product.slug}
        productTitle={product.title}
        value={product.price}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <section className="productDetail">
        <div className="productGallery">
          <div className="mainProductImage">
            {product.images?.[0] ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                width={900}
                height={900}
                priority
              />
            ) : null}
          </div>
        </div>

        <div className="productDetailInfo">
          {product.offer && <span className="productBadge">Oferta</span>}

          <h1>{product.title}</h1>

          <p>{product.description}</p>

          <div className="productPrices">
            <strong className="productDetailPrice">
              ${product.price.toLocaleString("es-AR")}
            </strong>

            {product.compareAtPrice && (
              <span className="comparePrice">
                ${product.compareAtPrice.toLocaleString("es-AR")}
              </span>
            )}
          </div>

          <ProductVariantSelector product={product} tenantSlug={store} />

          <div className="productTrustBox">
            <p>Compra segura</p>
            <p>Atención por WhatsApp</p>
            <p>Envíos disponibles</p>
          </div>

          <div className="productSpecs">
            <h2>Características</h2>

            {Object.entries(product.properties || {}).map(([key, value]) => (
              <div key={key} className="specRow">
                <span>{key}</span>
                <strong>
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductSlider
        title="Productos relacionados"
        products={relatedProducts}
        store={store}
      />
    </div>
  );
}