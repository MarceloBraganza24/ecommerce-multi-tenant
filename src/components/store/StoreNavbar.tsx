"use client";

import { useState } from "react";
import type { CategoryTree, TenantConfig } from "@/types/store";
import { HamburgerMenu } from "./HamburgerMenu";
import { useCart } from "./CartProvider";
import Image from "next/image";

type Props = {
  tenant: TenantConfig;
  categoryTree: CategoryTree[];
};

export function StoreNavbar({ tenant, categoryTree }: Props) {
  const [open, setOpen] = useState(false);

  const { openCart, items } = useCart();

  const cartCount = items.length;

  return (
    <>
      <header className="storeNavbar">
        <button className="navIconButton" onClick={() => setOpen(true)}>
          ☰
        </button>

        <a href={`/${tenant.slug}`} className="storeLogo">
          {tenant.appearance?.logoImage ? (
            <Image
              src={tenant.appearance.logoImage}
              alt={tenant.name}
              width={140}
              height={40}
              style={{ objectFit: "contain" }}
            />
          ) : (
            tenant.logoText
          )}
        </a>

        <div className="navActions">
          <a href={`/${tenant.slug}/productos`} className="navIconButton">
            🔍
          </a>

          <button className="navIconButton cartButton" onClick={openCart}>
            🛒
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
        </div>
      </header>

      <HamburgerMenu
        tenant={tenant}
        open={open}
        categoryTree={categoryTree}
        onClose={() => setOpen(false)}
      />
    </>
  );
}