import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";
import { getProductsByTenantId } from "@/lib/products";
import { getCategoriesByTenantId } from "@/lib/categories";
import { getCategoryPathBySlug } from "@/lib/category-path";
import {
  buildDynamicFilterGroups,
  filterProducts,
  type ProductFilters,
} from "@/lib/filter-products";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductFiltersDrawer } from "@/components/store/ProductFiltersDrawer";
import { Breadcrumbs } from "@/components/store/Breadcrumbs";
import type { MongoCategory, MongoProduct } from "@/types/store";

type Props = {
  params: Promise<{ store: string }>;
  searchParams: Promise<ProductFilters>;
};

export default async function ProductsPage({ params, searchParams }: Props) {
  const { store } = await params;
  const filters = await searchParams;

  const tenant = await getTenantBySlug(store);
  if (!tenant) notFound();

  const allProducts = (await getProductsByTenantId(
    tenant._id
  )) as MongoProduct[];

  const allCategories = (await getCategoriesByTenantId(
    tenant._id
  )) as MongoCategory[];

  const filteredProducts = filterProducts(allProducts, filters);
  const filterGroups = buildDynamicFilterGroups(allProducts, allCategories);

  const categoryPath = getCategoryPathBySlug(allCategories, filters.categoria);

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
  ];

  return (
    <div className="innerPage productsPage">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="pageHeader productsHeader">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1>Productos</h1>
          <p>Filtrá, ordená y encontrá el producto ideal para vos.</p>
        </div>
      </div>

      <ProductFiltersDrawer
        groups={filterGroups}
        totalResults={filteredProducts.length}
      />

      <div className="productGrid">
        {filteredProducts.map((product) => (
          <ProductCard key={String(product._id)} product={product} store={store} />
        ))}
      </div>

      {!filteredProducts.length && (
        <div className="emptyState">
          <h2>No encontramos productos</h2>
          <p>Probá borrar filtros o buscar otra palabra.</p>
        </div>
      )}
    </div>
  );
}