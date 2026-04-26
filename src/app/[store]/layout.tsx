import { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";
import { getCategoriesByTenantId } from "@/lib/categories";
import { buildCategoryTree } from "@/lib/category-tree";
import { getAppearanceVars, getFontClass, getLayoutClass } from "@/lib/appearance";
import { PromoTicker } from "@/components/store/PromoTicker";
import { StoreNavbar } from "@/components/store/StoreNavbar";
import { FloatingButtons } from "@/components/store/FloatingButtons";
import { Footer } from "@/components/store/Footer";
import { CartProvider } from "@/components/store/CartProvider";
import { CartDrawer } from "@/components/store/CartDrawer";
import { PageViewTracker } from "@/components/store/PageViewTracker";
import type { MongoCategory } from "@/types/store";

type Props = {
  children: ReactNode;
  params: Promise<{ store: string }>;
};

export default async function StoreLayout({ children, params }: Props) {
  const { store } = await params;

  const tenant = await getTenantBySlug(store);
  if (!tenant) notFound();

  const categories = (await getCategoriesByTenantId(
    tenant._id
  )) as MongoCategory[];

  const categoryTree = buildCategoryTree(categories);

  const appearance = tenant.appearance || {};
  const style = getAppearanceVars({
    ...appearance,
    primaryColor: appearance.primaryColor || tenant.primaryColor,
  });

  const className = [
    "storeThemeRoot",
    getFontClass(appearance.fontStyle),
    getLayoutClass(appearance.layoutStyle),
  ].join(" ");

  return (
    <CartProvider store={store}>
      <div className={className} style={style}>
        <PageViewTracker tenantSlug={store} />
        <PromoTicker tenant={tenant} />
        <StoreNavbar tenant={tenant} categoryTree={categoryTree} />
        <main>{children}</main>
        <CartDrawer store={store} />
        <FloatingButtons whatsapp={tenant.whatsapp} />
        <Footer tenant={tenant} />
      </div>
    </CartProvider>
  );
}