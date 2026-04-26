import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";

export async function getTenantBySlug(slug: string) {
  await connectDB();

  const tenant = await Tenant.findOne({
    slug,
    active: true,
  }).lean();

  if (!tenant) return null;

  return JSON.parse(JSON.stringify(tenant));
}