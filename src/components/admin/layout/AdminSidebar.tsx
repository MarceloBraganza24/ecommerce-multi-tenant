"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

type Props = {
  store: string;
  storeName: string;
};

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
  },
  {
    label: "Productos",
    href: "/admin/productos",
  },
  {
    label: "Categorías",
    href: "/admin/categorias",
  },
  {
    label: "Pedidos",
    href: "/admin/pedidos",
  },
  {
    label: "Home Builder",
    href: "/admin/home-builder",
  },
  {
    label: "Apariencia",
    href: "/admin/apariencia",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
  },
  {
    label: "Dominio",
    href: "/admin/dominio",
  },
  {
    label: "Configuración",
    href: "/admin/configuracion",
  },
];

export function AdminSidebar({ store, storeName }: Props) {
  const pathname = usePathname();

  async function handleLogout() {
    await signOut({
      redirect: true,
      callbackUrl: `/${store}/admin/login`,
    });
  }

  return (
    <aside className="flex min-h-screen w-72 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Tienda
        </p>

        <h2 className="mt-1 truncate text-lg font-bold text-gray-950">
          {storeName}
        </h2>

        <Link
          href={`/${store}`}
          className="mt-2 inline-block text-sm text-gray-500 hover:text-gray-950"
        >
          Ver tienda
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const href = `/${store}${item.href}`;
          const active =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={item.href}
              href={href}
              className={`flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-violet-50 text-violet-700 border border-violet-100"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-950 border border-transparent"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}