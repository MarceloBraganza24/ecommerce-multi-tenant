import type { CategoryTree, MongoCategory } from "@/types/store";

export function buildCategoryTree(categories: MongoCategory[]): CategoryTree[] {
  const map = new Map<string, CategoryTree>();
  const tree: CategoryTree[] = [];

  categories.forEach((category) => {
    map.set(String(category._id), {
      ...category,
      children: [],
    });
  });

  map.forEach((category) => {
    if (category.parentId) {
      const parent = map.get(String(category.parentId));

      if (parent) {
        parent.children.push(category);
      }

      return;
    }

    tree.push(category);
  });

  return tree;
}