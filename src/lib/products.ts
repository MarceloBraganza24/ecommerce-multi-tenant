import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export async function getProductsByTenantId(tenantId: string) {
  await connectDB();

  const products = await Product.find({
    tenantId,
    active: true,
  })
    .sort({ createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(products));
}

export async function getProductBySlug(tenantId: string, slug: string) {
  await connectDB();

  const product = await Product.findOne({
    tenantId,
    slug,
    active: true,
  }).lean();

  if (!product) return null;

  return JSON.parse(JSON.stringify(product));
}