import { Schema, models, model } from "mongoose";

const OrderSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    publicCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    buyer: {
      name: String,
      email: String,
      phone: String,
      dni: String,
      address: String,
      city: String,
      province: String,
      postalCode: String,
      notes: String,
    },

    items: [
      {
        productId: String,
        variantSku: String,
        title: String,
        slug: String,
        quantity: Number,
        unitPrice: Number,
        image: String,
        talle: String,
        color: String,
      },
    ],

    itemsTotal: Number,

    shippingTotal: {
      type: Number,
      default: 0,
    },

    total: Number,

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "preparing",
        "shipped",
        "delivered",
        "cancelled",
        "failed",
      ],
      default: "pending",
      index: true,
    },

    stockDiscountedAt: Date,

    mp: {
      preferenceId: String,
      paymentId: String,
      status: String,
      externalReference: String,
      initPoint: String,
      approvedAt: Date,
      raw: Schema.Types.Mixed,
    },
    stockReservedAt: Date,
    stockReleasedAt: Date,
    trackingNumber: String,
    shippingCarrier: String,
    shippingMethod: String,
    shippingNotes: String,
    delivery: {
      type: {
        type: String,
        enum: ["shipping", "pickup"],
        default: "shipping",
      },
      provider: String,
      service: String,
      price: Number,
      eta: String,
    },
    shipping: {
      deliveryType: String,
      provider: String,
      service: String,
      price: Number,
      eta: String,
      postalCodeOrigin: String,
      postalCodeDestination: String,
    },
  },
  { timestamps: true }
);

export const Order = models.Order || model("Order", OrderSchema);