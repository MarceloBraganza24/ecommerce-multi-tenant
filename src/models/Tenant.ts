import { Schema, models, model } from "mongoose";

const TenantSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    logoText: { type: String, required: true },
    whatsapp: { type: String, required: true },
    primaryColor: { type: String, default: "#111827" },
    freeShippingFrom: { type: Number, default: 0 },

    heroTitle: String,
    heroSubtitle: String,
    heroImage: String,
    bannerText: String,

    mpAccessToken: String,

    adminKey: {
      type: String,
      required: true,
      default: "admin123",
    },

    social: {
      instagram: String,
      facebook: String,
    },

    active: { type: Boolean, default: true },
    shipping: {
      freeFrom: { type: Number, default: 0 },
      flatRate: { type: Number, default: 0 },
      localPickupEnabled: { type: Boolean, default: true },
      localPickupLabel: { type: String, default: "Retiro en local" },
      postalCodeOrigin: String,
      provider: {
        type: String,
        enum: ["flat", "correo_argentino", "andreani"],
        default: "flat",
      },
      correoArgentino: {
        baseUrl: String,
        username: String,
        password: String,
        customerId: String,
      },
      andreani: {
        baseUrl: String,
        username: String,
        password: String,
        clientId: String,
        contract: String,
      },
    },
    appearance: {
      logoImage: String,
      favicon: String,

      primaryColor: { type: String, default: "#111827" },
      secondaryColor: { type: String, default: "#f59e0b" },
      backgroundColor: { type: String, default: "#ffffff" },
      textColor: { type: String, default: "#111827" },

      buttonRadius: {
        type: String,
        enum: ["square", "soft", "pill"],
        default: "soft",
      },

      fontStyle: {
        type: String,
        enum: ["modern", "elegant", "classic"],
        default: "modern",
      },

      layoutStyle: {
        type: String,
        enum: ["minimal", "sport", "premium"],
        default: "minimal",
      },

      promoBarEnabled: {
        type: Boolean,
        default: true,
      },

      promoMessages: {
        type: [String],
        default: ["Envío gratis en compras seleccionadas", "Pagá seguro", "Cambios simples"],
      },

      heroTitle: String,
      heroSubtitle: String,
      heroImage: String,
      heroCtaText: String,

      bannerTitle: String,
      bannerSubtitle: String,
      bannerImage: String,
    },
  },
  { timestamps: true }
);

export const Tenant = models.Tenant || model("Tenant", TenantSchema);