import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import type { MongoCategory } from "@/types/store";

export async function getCategoriesByTenantId(tenantId: string) {
  await connectDB();

  const categories = await Category.find({
    tenantId,
    active: true,
  })
    .sort({ name: 1 })
    .lean();

  return JSON.parse(JSON.stringify(categories));
}

export function buildCategoryTree(categories: MongoCategory[], parentId: string | null = null): MongoCategory[] {
  return categories
    .filter((category) => {
      const currentParentId = category.parentId ? String(category.parentId) : null;
      return currentParentId === parentId;
    })
    .map((category) => ({
      ...category,
      children: buildCategoryTree(categories, String(category._id)),
    }));
}