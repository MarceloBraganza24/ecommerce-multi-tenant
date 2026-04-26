import { Schema, models, model } from "mongoose";

const AdminUserSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      default: null,
      index: true,
    },
    role: {
      type: String,
      enum: ["super_admin", "tenant_admin"],
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    name: String,
    passwordHash: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const AdminUser =
  models.AdminUser || model("AdminUser", AdminUserSchema);