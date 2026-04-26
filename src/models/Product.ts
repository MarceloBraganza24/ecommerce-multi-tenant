import { Schema, models, model } from "mongoose";

const ProductSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: String,
    price: {
      type: Number,
      required: true,
    },
    compareAtPrice: Number,
    brand: String,
    categorySlug: {
      type: String,
      required: true,
    },
    images: [String],
    featured: {
      type: Boolean,
      default: false,
    },
    offer: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      default: 0,
    },
    properties: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    active: {
      type: Boolean,
      default: true,
    },
    variants: [
      {
        sku: { type: String, required: true },
        talle: String,
        color: String,
        stock: { type: Number, default: 0 },
        price: Number,
        compareAtPrice: Number,
        image: String,
        active: { type: Boolean, default: true },
      },
    ],
  },
  { timestamps: true }
);

ProductSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

export const Product = models.Product || model("Product", ProductSchema);