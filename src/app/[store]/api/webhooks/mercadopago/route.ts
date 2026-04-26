import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";
import { releaseStock } from "@/lib/stock";
import { sendEmail } from "@/lib/send-email";
import { sendWhatsAppText } from "@/lib/send-whatsapp";
import { orderPaidEmailTemplate } from "@/lib/email-templates";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const paymentId =
      body?.data?.id ||
      body?.id ||
      new URL(req.url).searchParams.get("data.id");

    const type =
      body?.type ||
      body?.topic ||
      new URL(req.url).searchParams.get("type") ||
      new URL(req.url).searchParams.get("topic");

    if (!paymentId || type !== "payment") {
      return NextResponse.json({ received: true });
    }

    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });

    const orderId = payment.external_reference;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ received: true });
    }

    order.mp = {
      ...order.mp,
      paymentId: String(payment.id),
      status: payment.status,
      raw: payment,
      approvedAt:
        payment.status === "approved" ? new Date() : order.mp?.approvedAt,
    };

    if (payment.status === "approved") {
      order.status = "paid";

      if (!order.stockDiscountedAt) {
        order.stockDiscountedAt = new Date();
      }

      if (order.buyer?.email) {
        await sendEmail({
          to: order.buyer.email,
          subject: `Pago confirmado - Pedido ${order.publicCode}`,
          html: orderPaidEmailTemplate({
            store: payment.metadata?.tenantSlug || payment.metadata?.tenant_slug || "",
            order,
          }),
        });
      }

      if (order.buyer?.phone) {
        try {
          await sendWhatsAppText({
          to: order.buyer.phone,
          message: `✅ Pago confirmado

          Hola ${order.buyer.name || ""}! Recibimos el pago de tu pedido ${order.publicCode}.

          Total: $${Number(order.total || 0).toLocaleString("es-AR")}

          Te vamos a avisar cuando esté en preparación o enviado.`,
            });
        } catch (e) {
          console.error("WhatsApp cliente error", e);
        }
      }

      if (process.env.WHATSAPP_ADMIN_TO) {
        try {
        await sendWhatsAppText({
          to: process.env.WHATSAPP_ADMIN_TO,
          message: `🛒 Nueva compra pagada

          Pedido: ${order.publicCode}
          Cliente: ${order.buyer?.name || "-"}
          Teléfono: ${order.buyer?.phone || "-"}
          Total: $${Number(order.total || 0).toLocaleString("es-AR")}`,
            });
        } catch (e) {
          console.error("WhatsApp cliente error", e);
        }
      }

      await AnalyticsEvent.create({
        tenantId: order.tenantId,
        tenantSlug:
          payment.metadata?.tenant_slug || payment.metadata?.tenantSlug || "",
        event: "purchase_paid",
        sessionId: `order-${String(order._id)}`,
        orderId: String(order._id),
        publicCode: order.publicCode,
        value: order.total || 0,
        currency: "ARS",
        metadata: {
          paymentId: payment.id,
          items: order.items,
        },
      });
    }

    if (
      ["rejected", "cancelled"].includes(String(payment.status)) &&
      order.stockReservedAt &&
      !order.stockReleasedAt
    ) {
      order.status = payment.status === "cancelled" ? "cancelled" : "failed";
      await releaseStock(order.items);
      order.stockReleasedAt = new Date();
    }

    await order.save();

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);

    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}