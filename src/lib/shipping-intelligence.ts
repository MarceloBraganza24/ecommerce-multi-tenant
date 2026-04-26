import { ShippingRateSample } from "@/models/ShippingRateSample";
import { ShippingZoneFallback } from "@/models/ShippingZoneFallback";
import type { ShippingQuote } from "@/types/store";

type ItemForShipping = {
  quantity: number;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
};

type SaveSampleArgs = {
  tenantId: string;
  quote: ShippingQuote;
  items: ItemForShipping[];
};

export function getRegionByPostalCode(cp?: string) {
  const code = String(cp || "").replace(/\D/g, "");
  const first = Number(code[0] || 0);

  if (!code) return "UNKNOWN";
  if (code.startsWith("10") || code.startsWith("11") || code.startsWith("12")) return "CABA";
  if (first === 1 || first === 2 || first === 3) return "BUENOS_AIRES_CENTRO";
  if (first === 4) return "CENTRO";
  if (first === 5) return "CUYO";
  if (first === 6) return "NOA_NEA";
  if (first === 7 || first === 8 || first === 9) return "PATAGONIA";

  return "ARGENTINA";
}

export function getPackageKey(items: ItemForShipping[]) {
  const totalQty = items.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
  const totalWeight = items.reduce(
    (acc, item) => acc + Number(item.weight || 500) * Number(item.quantity || 0),
    0
  );

  if (totalWeight <= 700 && totalQty <= 1) return "small";
  if (totalWeight <= 1800 && totalQty <= 4) return "medium";

  return "large";
}

function median(values: number[]) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2) return sorted[middle];

  return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function percentile(values: number[], p: number) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;

  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

export async function saveShippingSample({
  tenantId,
  quote,
  items,
}: SaveSampleArgs) {
  if (!quote.postalCodeDestination || quote.price <= 0) return;

  const region = getRegionByPostalCode(quote.postalCodeDestination);
  const packageKey = getPackageKey(items);

  await ShippingRateSample.create({
    tenantId,
    provider: quote.provider,
    region,
    packageKey,
    deliveredType: "D",
    postalCodeOrigin: quote.postalCodeOrigin,
    postalCodeDestination: quote.postalCodeDestination,
    service: quote.service,
    price: quote.price,
    eta: quote.eta,
    raw: quote,
  });

  const samples = await ShippingRateSample.find({
    tenantId,
    provider: quote.provider,
    region,
    packageKey,
    deliveredType: "D",
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const prices = samples
    .map((sample) => Number(sample.price || 0))
    .filter((price) => price > 0);

  await ShippingZoneFallback.updateOne(
    {
      tenantId,
      provider: quote.provider,
      region,
      packageKey,
      deliveredType: "D",
    },
    {
      $set: {
        sampleCount: prices.length,
        medianPrice: median(prices),
        p75Price: percentile(prices, 75),
        eta: quote.eta || "A coordinar",
      },
    },
    { upsert: true }
  );
}

export async function getEstimatedShippingQuote({
  tenantId,
  provider,
  postalCodeOrigin,
  postalCodeDestination,
  items,
}: {
  tenantId: string;
  provider: ShippingQuote["provider"];
  postalCodeOrigin?: string;
  postalCodeDestination: string;
  items: ItemForShipping[];
}): Promise<ShippingQuote | null> {
  const region = getRegionByPostalCode(postalCodeDestination);
  const packageKey = getPackageKey(items);

  const fallback = await ShippingZoneFallback.findOne({
    tenantId,
    provider,
    region,
    packageKey,
    deliveredType: "D",
  }).lean();

  if (!fallback) return null;

  const price = Number(fallback.p75Price || fallback.medianPrice || 0);
  if (!price) return null;

  return {
    provider,
    service: "Envío estimado",
    price,
    eta: fallback.eta || "A coordinar",
    deliveryType: "shipping",
    postalCodeOrigin,
    postalCodeDestination,
  };
}