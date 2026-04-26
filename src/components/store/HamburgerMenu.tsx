"use client";

import type { CategoryTree, TenantConfig } from "@/types/store";

type Props = {
  tenant: TenantConfig;
  open: boolean;
  categoryTree: CategoryTree[];
  onClose: () => void;
};

export function HamburgerMenu({ tenant, open, categoryTree, onClose }: Props) {
  return (
    <aside className={`hamburgerOverlay ${open ? "open" : ""}`}>
      <div className="hamburgerPanel">
        <button className="closeButton" onClick={onClose}>
          ×
        </button>

        <h2>{tenant.name}</h2>

        <nav className="mobileMenu">
          <a href={`/${tenant.slug}`}>Inicio</a>

          <details open>
            <summary>Categorías</summary>

            <div className="categoryTree">
              {categoryTree.map((category) => (
                <CategoryNode
                  key={category._id}
                  tenant={tenant}
                  category={category}
                />
              ))}
            </div>
          </details>

          <a href={`/${tenant.slug}/sobre-nosotros`}>Sobre nosotros</a>
          <a href={`/${tenant.slug}/contacto`}>Contacto</a>
          <a href={`/${tenant.slug}/buscar-pedido`}>Buscar mi pedido</a>
        </nav>
      </div>
    </aside>
  );
}

type CategoryNodeProps = {
  tenant: TenantConfig;
  category: CategoryTree;
};

function CategoryNode({ tenant, category }: CategoryNodeProps) {
  const hasChildren = category.children.length > 0;

  if (!hasChildren) {
    return (
      <a href={`/${tenant.slug}/productos?categoria=${category.slug}`}>
        {category.name}
      </a>
    );
  }

  return (
    <details>
      <summary>{category.name}</summary>

      <div className="categoryTreeNested">
        {category.children.map((child) => (
          <CategoryNode key={child._id} tenant={tenant} category={child} />
        ))}
      </div>
    </details>
  );
}