import Link from "next/link";
import { BuilderFooter as BuilderFooterType } from "@/types/builder";

type Props = {
  footer?: BuilderFooterType;
  store: string;
  storeName: string;
};

function normalizeHref(href: string, store: string) {
  if (!href) return `/${store}`;
  if (href.startsWith("http")) return href;
  if (href.startsWith(`/${store}`)) return href;
  if (href.startsWith("/")) return `/${store}${href}`;
  return `/${store}/${href}`;
}

export function BuilderFooter({ footer, store, storeName }: Props) {
  if (!footer?.enabled) return null;

  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-10 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="text-lg font-bold text-gray-950">{storeName}</h2>

          {footer.description && (
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
              {footer.description}
            </p>
          )}

          <p className="mt-5 text-xs text-gray-400">
            © {new Date().getFullYear()} {storeName}.{" "}
            {footer.legalText || "Todos los derechos reservados."}
          </p>
        </div>

        {footer.links.length > 0 && (
          <nav className="flex flex-col gap-3 md:items-end">
            {footer.links.map((link, index) => (
              <Link
                key={`${link.href}-${index}`}
                href={normalizeHref(link.href, store)}
                className="text-sm text-gray-600 hover:text-gray-950"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </footer>
  );
}