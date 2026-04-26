import type { MongoCategory, MongoProduct } from "@/types/store";

export type SortOption =
  | "precio-menor"
  | "precio-mayor"
  | "novedades"
  | "mas-vendido"
  | "destacados";

export type FilterOption = {
  label: string;
  value: string;
  count: number;
  colorHex?: string;
};

export type FilterGroup = {
  key: string;
  label: string;
  options: FilterOption[];
};

export type ProductFilters = {
  q?: string;
  categoria?: string;
  marca?: string;
  ordenar?: SortOption | string;
  min?: string;
  max?: string;
  [key: string]: string | undefined;
};

const COLOR_MAP: Record<string, string> = {
  blanco: "#f8fafc",
  negro: "#000000",
  azul: "#2563eb",
  verde: "#22c55e",
  gris: "#9ca3af",
  rojo: "#dc2626",
  naranja: "#f97316",
  amarillo: "#facc15",
  violeta: "#7c3aed",
  turquesa: "#14b8a6",
  beige: "#d6c6b8",
  rosa: "#ec4899",
  marron: "#8b5e34",
  marrón: "#8b5e34",
  plateado: "#c0c0c0",
  dorado: "#d4af37",
};

const LABELS: Record<string, string> = {
  talle: "Talle",
  color: "Color",
  sexo: "Sexo",
  tipoProducto: "Tipo de producto",
  deporte: "Deportes",
  equipacion: "Equipaciones",
  modelo: "Modelos",
  descuento: "Descuentos",
  material: "Material",
  capacidad: "Capacidad",
  uso: "Uso",
  marca: "Marca",
  categoria: "Categoría",
};

function normalizeText(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function titleFromKey(key: string) {
  return (
    LABELS[key] ||
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function addCount(map: Map<string, number>, value: string) {
  map.set(value, (map.get(value) || 0) + 1);
}

export function getUniqueBrands(products: MongoProduct[]) {
  const map = new Map<string, number>();

  products.forEach((product) => {
    if (product.brand) addCount(map, product.brand);
  });

  return Array.from(map.entries()).map(([value, count]) => ({
    label: value,
    value,
    count,
  }));
}

export function getCategoryOptions(
  products: MongoProduct[],
  categories: MongoCategory[]
) {
  const map = new Map<string, number>();

  products.forEach((product) => {
    if (product.categorySlug) addCount(map, product.categorySlug);
  });

  return Array.from(map.entries()).map(([value, count]) => {
    const category = categories.find((item) => item.slug === value);

    return {
      label: category?.name || value,
      value,
      count,
    };
  });
}

export function buildDynamicFilterGroups(
  products: MongoProduct[],
  categories: MongoCategory[]
): FilterGroup[] {
  const reservedKeys = new Set([
    "q",
    "categoria",
    "marca",
    "ordenar",
    "min",
    "max",
  ]);

  const groupsMap = new Map<string, Map<string, number>>();

  products.forEach((product) => {
    Object.entries(product.properties || {}).forEach(([key, rawValue]) => {
      if (reservedKeys.has(key)) return;
      if (rawValue === undefined || rawValue === null || rawValue === "") return;

      const values = Array.isArray(rawValue) ? rawValue : [rawValue];

      values.forEach((singleValue) => {
        const value = String(singleValue).trim();
        if (!value) return;

        if (!groupsMap.has(key)) groupsMap.set(key, new Map());
        addCount(groupsMap.get(key)!, value);
      });
    });
  });

  const categoryOptions = getCategoryOptions(products, categories);
  const brandOptions = getUniqueBrands(products);

  const baseGroups: FilterGroup[] = [
    {
      key: "categoria",
      label: "Categorías",
      options: categoryOptions,
    },
    {
      key: "marca",
      label: "Marca",
      options: brandOptions,
    },
  ].filter((group) => group.options.length > 0);

  const dynamicGroups: FilterGroup[] = Array.from(groupsMap.entries()).map(
    ([key, valuesMap]) => ({
      key,
      label: titleFromKey(key),
      options: Array.from(valuesMap.entries())
        .map(([value, count]) => {
          const colorKey = normalizeText(value);

          return {
            label: value,
            value,
            count,
            colorHex: key.toLowerCase() === "color" ? COLOR_MAP[colorKey] : undefined,
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label)),
    })
  );

  const preferredOrder = [
    "categoria",
    "marca",
    "sexo",
    "talle",
    "color",
    "tipoProducto",
    "deporte",
    "equipacion",
    "modelo",
    "material",
    "capacidad",
    "uso",
    "descuento",
  ];

  return [...baseGroups, ...dynamicGroups].sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a.key);
    const bIndex = preferredOrder.indexOf(b.key);

    if (aIndex === -1 && bIndex === -1) return a.label.localeCompare(b.label);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });
}

export function filterProducts(
  products: MongoProduct[],
  filters: ProductFilters
): MongoProduct[] {
  let result = [...products];

  if (filters.q) {
    const q = normalizeText(filters.q);

    result = result.filter((product) => {
      return (
        normalizeText(product.title).includes(q) ||
        normalizeText(product.description).includes(q) ||
        normalizeText(product.brand).includes(q)
      );
    });
  }

  if (filters.categoria) {
    result = result.filter(
      (product) => product.categorySlug === filters.categoria
    );
  }

  if (filters.marca) {
    result = result.filter((product) => product.brand === filters.marca);
  }

  if (filters.min) {
    const min = Number(filters.min);
    if (Number.isFinite(min)) {
      result = result.filter((product) => product.price >= min);
    }
  }

  if (filters.max) {
    const max = Number(filters.max);
    if (Number.isFinite(max)) {
      result = result.filter((product) => product.price <= max);
    }
  }

  const reservedKeys = new Set([
    "q",
    "categoria",
    "marca",
    "ordenar",
    "min",
    "max",
  ]);

  Object.entries(filters).forEach(([key, value]) => {
    if (reservedKeys.has(key)) return;
    if (!value) return;

    const selectedValues = value.split(",").map((item) => normalizeText(item));

    result = result.filter((product) => {
      const propertyValue = product.properties?.[key];
      if (propertyValue === undefined || propertyValue === null) return false;

      if (Array.isArray(propertyValue)) {
        return propertyValue.some((item) =>
          selectedValues.includes(normalizeText(item))
        );
      }

      return selectedValues.includes(normalizeText(propertyValue));
    });
  });

  switch (filters.ordenar) {
    case "precio-menor":
      result.sort((a, b) => a.price - b.price);
      break;

    case "precio-mayor":
      result.sort((a, b) => b.price - a.price);
      break;

    case "novedades":
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
      break;

    case "destacados":
      result.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;

    case "mas-vendido":
      result.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;

    default:
      break;
  }

  return result;
}

export function countActiveFilters(filters: ProductFilters) {
  return Object.entries(filters).filter(([key, value]) => {
    if (!value) return false;
    if (key === "ordenar") return false;
    return true;
  }).length;
}