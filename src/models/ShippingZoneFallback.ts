import { Schema, models, model } from "mongoose";

const ShippingZoneFallbackSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    provider: { type: String, required: true },
    region: { type: String, required: true },
    packageKey: { type: String, required: true },
    deliveredType: { type: String, default: "D" },
    sampleCount: { type: Number, default: 0 },
    medianPrice: { type: Number, default: 0 },
    p75Price: { type: Number, default: 0 },
    eta: String,
  },
  { timestamps: true }
);

ShippingZoneFallbackSchema.index(
  { tenantId: 1, provider: 1, region: 1, packageKey: 1, deliveredType: 1 },
  { unique: true }
);

export const ShippingZoneFallback =
  models.ShippingZoneFallback ||
  model("ShippingZoneFallback", ShippingZoneFallbackSchema);