import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";

export async function getTenantBySlug(slug: string) {
  await connectDB();

  const tenant = await Tenant.findOne({ slug }).lean();

  if (!tenant) return null;

  // 🔥 TRIAL LOGIC
  const isTrialExpired =
    tenant.trialEndsAt &&
    new Date() > new Date(tenant.trialEndsAt);

  if (isTrialExpired && tenant.plan === "pro") {
    tenant.plan = "free";
  }

  return tenant;
}