import { Schema, models, model } from "mongoose";

const AnalyticsEventSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    tenantSlug: {
      type: String,
      required: true,
      index: true,
    },

    event: {
      type: String,
      required: true,
      index: true,
    },

    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    path: String,
    referrer: String,

    productId: String,
    productSlug: String,
    productTitle: String,

    orderId: String,
    publicCode: String,

    value: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "ARS",
    },

    utm: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

AnalyticsEventSchema.index({ tenantId: 1, event: 1, createdAt: -1 });
AnalyticsEventSchema.index({ tenantId: 1, sessionId: 1, createdAt: -1 });

export const AnalyticsEvent =
  models.AnalyticsEvent || model("AnalyticsEvent", AnalyticsEventSchema);