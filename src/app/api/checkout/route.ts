import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getTenantBySlug } from "@/lib/tenants";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { reserveStock } from "@/lib/stock";
import type {
  CheckoutBody,
  MongoProduct,
  OrderItem,
} from "@/types/store";

function createPublicCode() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = (await req.json()) as CheckoutBody & {
      store?: string;
    };

    const store = String(body.store || "").trim();

    if (!store) {
      return NextResponse.json(
        { error: "Falta store" },
        { status: 400 }
      );
    }

    const tenant = await getTenantBySlug(store);

    if (!tenant) {
      return NextResponse.json(
        { error: "Tienda no encontrada" },
        { status: 404 }
      );
    }

    const accessToken =
      tenant.mpAccessToken || process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Falta configurar Mercado Pago" },
        { status: 500 }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
      return NextResponse.json(
        {
          error:
            "Falta configurar NEXT_PUBLIC_APP_URL",
        },
        { status: 500 }
      );
    }

    const cartItems = body.items || [];

    if (!cartItems.length) {
      return NextResponse.json(
        { error: "Carrito vacío" },
        { status: 400 }
      );
    }

    if (
      !body.buyer?.name ||
      !body.buyer?.email ||
      !body.buyer?.phone
    ) {
      return NextResponse.json(
        { error: "Faltan datos del comprador" },
        { status: 400 }
      );
    }

    const productIds = cartItems.map(
      (item) => item.productId
    );

    const dbProducts = (await Product.find({
      _id: { $in: productIds },
      tenantId: tenant._id,
      active: true,
    }).lean()) as MongoProduct[];

    const safeItems: OrderItem[] = cartItems.map(
      (cartItem) => {
        const product = dbProducts.find(
          (dbProduct) =>
            String(dbProduct._id) ===
            String(cartItem.productId)
        );

        if (!product) {
          throw new Error("Producto inválido");
        }

        const quantity = Number(cartItem.quantity);

        if (
          !Number.isFinite(quantity) ||
          quantity <= 0
        ) {
          throw new Error("Cantidad inválida");
        }

        const variantSku = cartItem.variantSku;

        const variant = variantSku
          ? product.variants?.find(
              (item) => item.sku === variantSku
            )
          : undefined;

        if (product.variants?.length && !variant) {
          throw new Error("Variante inválida");
        }

        if (variant && variant.stock < quantity) {
          throw new Error("Stock insuficiente");
        }

        if (
          !variant &&
          Number(product.stock || 0) < quantity
        ) {
          throw new Error("Stock insuficiente");
        }

        const unitPrice = Number(
          variant?.price || product.price
        );

        const image =
          variant?.image || product.images?.[0];

        return {
          productId: String(product._id),
          variantSku,
          title: product.title,
          slug: product.slug,
          quantity,
          unitPrice,
          image,
          talle: variant?.talle,
          color: variant?.color,
        };
      }
    );

    await reserveStock(safeItems);

    const itemsTotal = safeItems.reduce(
      (acc, item) =>
        acc + item.unitPrice * item.quantity,
      0
    );

    const shippingTotal = Number(
      body.shipping?.quote?.price || 0
    );

    const total = itemsTotal + shippingTotal;

    const publicCode = createPublicCode();

    const order = await Order.create({
      tenantId: tenant._id,
      publicCode,
      buyer: body.buyer,
      items: safeItems,
      itemsTotal,
      shippingTotal,
      total,
      status: "pending",
      stockReservedAt: new Date(),

      shipping: {
        deliveryType:
          body.shipping?.deliveryType,

        provider:
          body.shipping?.quote?.provider,

        service:
          body.shipping?.quote?.service,

        price: shippingTotal,

        eta: body.shipping?.quote?.eta,

        postalCodeOrigin:
          body.shipping?.quote
            ?.postalCodeOrigin,

        postalCodeDestination:
          body.shipping?.quote
            ?.postalCodeDestination,
      },
    });

    const client = new MercadoPagoConfig({
      accessToken,
    });

    const preference = new Preference(client);

    const mpPreference = await preference.create({
      body: {
        items: safeItems.map((item) => ({
          id:
            item.variantSku ||
            item.productId,

          title: item.title,

          quantity: item.quantity,

          unit_price: item.unitPrice,

          currency_id: "ARS",
        })),

        external_reference: String(order._id),

        notification_url: `${siteUrl}/api/webhooks/mercadopago`,

        back_urls: {
          success: `${siteUrl}/${store}/checkout/success?order=${publicCode}`,

          failure: `${siteUrl}/${store}/checkout/failure?order=${publicCode}`,

          pending: `${siteUrl}/${store}/checkout/pending?order=${publicCode}`,
        },

        auto_return: "approved",

        metadata: {
          tenantSlug: store,
          orderId: String(order._id),
          publicCode,
        },
      },
    });

    order.mp = {
      preferenceId: mpPreference.id,
      externalReference: String(order._id),
      initPoint: mpPreference.init_point,
    };

    await order.save();

    return NextResponse.json({
      orderId: String(order._id),
      publicCode,
      preferenceId: mpPreference.id,
      initPoint: mpPreference.init_point,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo crear el checkout",
      },
      { status: 500 }
    );
  }
}