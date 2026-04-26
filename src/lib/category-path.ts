import type { MongoCategory } from "@/types/store";

export function getCategoryPathBySlug(
  categories: MongoCategory[],
  slug?: string
): MongoCategory[] {
  if (!slug) return [];

  const category = categories.find((item) => item.slug === slug);
  if (!category) return [];

  const path: MongoCategory[] = [category];

  let currentParentId = category.parentId ? String(category.parentId) : null;

  while (currentParentId) {
    const parent = categories.find(
      (item) => String(item._id) === currentParentId
    );

    if (!parent) break;

    path.unshift(parent);
    currentParentId = parent.parentId ? String(parent.parentId) : null;
  }

  return path;
}