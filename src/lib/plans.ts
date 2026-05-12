export type PlanType = "free" | "pro";

export type FeatureKey =
  | "advanced"
  | "export_pdf"
  | "unlimited_products"
  | "custom_domain";

export function checkPlan(
  plan: PlanType,
  feature: FeatureKey
): boolean {
  if (plan === "pro") return true;

  const freeBlocked: FeatureKey[] = [
    "advanced",
    "export_pdf",
    "unlimited_products",
    "custom_domain",
  ];

  return !freeBlocked.includes(feature);
}