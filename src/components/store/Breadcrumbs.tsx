type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: Props) {
  if (!items.length) return null;

  return (
    <nav className="breadcrumbs" aria-label="Ruta de navegación">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="breadcrumbItem">
            {item.href && !isLast ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span>{item.label}</span>
            )}

            {!isLast && <span className="breadcrumbSeparator">/</span>}
          </span>
        );
      })}
    </nav>
  );
}