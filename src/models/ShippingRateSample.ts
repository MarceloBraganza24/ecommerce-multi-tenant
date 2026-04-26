import { Schema, models, model } from "mongoose";

const ShippingRateSampleSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
    provider: { type: String, required: true, index: true },
    region: { type: String, required: true, index: true },
    packageKey: { type: String, required: true, index: true },
    deliveredType: { type: String, default: "D" },
    postalCodeOrigin: String,
    postalCodeDestination: String,
    service: String,
    price: Number,
    eta: String,
    raw: Schema.Types.Mixed,
  },
  { timestamps: true }
);

ShippingRateSampleSchema.index({
  tenantId: 1,
  provider: 1,
  region: 1,
  packageKey: 1,
  createdAt: -1,
});

export const ShippingRateSample =
  models.ShippingRateSample ||
  model("ShippingRateSample", ShippingRateSampleSchema);