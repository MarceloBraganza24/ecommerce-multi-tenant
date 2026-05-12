"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PromoTicker } from "@/components/store/PromoTicker";
import { StoreNavbar } from "@/components/store/StoreNavbar";
import { FloatingButtons } from "@/components/store/FloatingButtons";
import { Footer } from "@/components/store/Footer";
import { CartDrawer } from "@/components/store/CartDrawer";
import { PageViewTracker } from "@/components/store/PageViewTracker";
import type { TenantConfig, CategoryTree } from "@/types/store";

type Props = {
  store: string;
  tenant: TenantConfig;
  categoryTree: CategoryTree[];
  children: ReactNode;
};

export function StoreChrome({ store, tenant, categoryTree, children }: Props) {
  const pathname = usePathname();

  const isAdmin = pathname.includes(`/${store}/admin`);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <PageViewTracker tenantSlug={store} />
      <PromoTicker tenant={tenant} />
      <StoreNavbar tenant={tenant} categoryTree={categoryTree} />
      <main>{children}</main>
      <CartDrawer store={store} />
      <FloatingButtons whatsapp={tenant.whatsapp} />
      <Footer tenant={tenant} />
    </>
  );
}