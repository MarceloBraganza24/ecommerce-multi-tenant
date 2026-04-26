import { Schema, models, model } from "mongoose";

const CategorySchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    image: String,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

CategorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });

export const Category = models.Category || model("Category", CategorySchema);