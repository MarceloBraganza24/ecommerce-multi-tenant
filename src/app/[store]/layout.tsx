import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";
import { getCategoriesByTenantId } from "@/lib/categories";
import { buildCategoryTree } from "@/lib/category-tree";
import {
  getAppearanceVars,
  getFontClass,
  getLayoutClass,
} from "@/lib/appearance";
import { CartProvider } from "@/components/store/CartProvider";
import { StoreChrome } from "@/components/store/StoreChrome";
import type { MongoCategory } from "@/types/store";

type Props = {
  children: ReactNode;
  params: Promise<{ store: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { store } = await params;

  const tenant = await getTenantBySlug(store);

  if (!tenant) {
    return {
      title: "Tienda no encontrada",
      description: "La tienda solicitada no existe.",
    };
  }

  return {
    title: tenant.seo?.title || tenant.name,
    description:
      tenant.seo?.description ||
      `Comprá fácil, rápido y seguro en ${tenant.name}.`,
  };
}

export default async function StoreLayout({ children, params }: Props) {
  const { store } = await params;

  const tenant = await getTenantBySlug(store);

  if (!tenant) notFound();

  const categories = (await getCategoriesByTenantId(
    tenant._id
  )) as MongoCategory[];

  const categoryTree = buildCategoryTree(categories);

  // 🔥 convertir Mongo/Mongoose a objetos planos
  const safeTenant = JSON.parse(JSON.stringify(tenant));
  const safeCategoryTree = JSON.parse(JSON.stringify(categoryTree));

  const appearance = safeTenant.appearance || {};

  const style = getAppearanceVars({
    ...appearance,
    primaryColor: appearance.primaryColor || safeTenant.primaryColor,
  });

  const className = [
    "storeThemeRoot",
    getFontClass(appearance.fontStyle),
    getLayoutClass(appearance.layoutStyle),
  ].join(" ");

  return (
    <CartProvider store={store}>
      <div className={className} style={style}>
        <StoreChrome
          store={store}
          tenant={safeTenant}
          categoryTree={safeCategoryTree}
        >
          {children}
        </StoreChrome>
      </div>
    </CartProvider>
  );
}