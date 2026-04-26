import { sendWhatsAppTemplate, sendWhatsAppText } from "@/lib/send-whatsapp";
import type { MongoOrder, OrderStatus } from "@/types/store";

function getTrackingUrl(store: string, order: MongoOrder) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const email = order.buyer?.email || "";

  return `${baseUrl}/${store}/buscar-pedido?order=${encodeURIComponent(
    order.publicCode
  )}&email=${encodeURIComponent(email)}`;
}

function getTemplateName(status: OrderStatus) {
  const templates: Partial<Record<OrderStatus, string | undefined>> = {
    preparing: process.env.WHATSAPP_TEMPLATE_PREPARING,
    shipped: process.env.WHATSAPP_TEMPLATE_SHIPPED,
    delivered: process.env.WHATSAPP_TEMPLATE_DELIVERED,
  };

  return templates[status];
}

function getStatusMessage(status: OrderStatus, store: string, order: MongoOrder) {
  const trackingUrl = getTrackingUrl(store, order);
  const name = order.buyer?.name || "";
  const code = order.publicCode;

  if (status === "preparing") {
    return `🧾 Tu pedido está en preparación

Hola ${name}! Tu pedido ${code} ya está siendo preparado.

Podés seguirlo acá:
${trackingUrl}`;
  }

  if (status === "shipped") {
    return `📦 Tu pedido fue enviado

Hola ${name}! Tu pedido ${code} ya fue despachado.

${
  order.shippingCarrier
    ? `Correo/Transporte: ${order.shippingCarrier}\n`
    : ""
}${
    order.trackingNumber
      ? `Seguimiento: ${order.trackingNumber}\n`
      : ""
  }

Podés ver el estado acá:
${trackingUrl}`;
  }

  if (status === "delivered") {
    return `✅ Pedido entregado

Hola ${name}! Tu pedido ${code} figura como entregado.

Gracias por comprar con nosotros 💛

Podés ver el detalle acá:
${trackingUrl}`;
  }

  return "";
}

export async function sendOrderStatusWhatsApp({
  store,
  order,
  status,
}: {
  store: string;
  order: MongoOrder;
  status: OrderStatus;
}) {
  const phone = order.buyer?.phone;
  if (!phone) return;

  if (!["preparing", "shipped", "delivered"].includes(status)) return;

  const useTemplates = process.env.WHATSAPP_USE_TEMPLATES === "true";
  const trackingUrl = getTrackingUrl(store, order);

  if (useTemplates) {
    const templateName = getTemplateName(status);

    if (!templateName) {
      console.warn(`No hay template configurado para estado ${status}`);
      return;
    }

    await sendWhatsAppTemplate({
      to: phone,
      templateName,
      bodyParameters: [
        {
          type: "text",
          text: order.buyer?.name || "cliente",
        },
        {
          type: "text",
          text: order.publicCode,
        },
      ],
      buttonUrlParameter: trackingUrl,
    });

    return;
  }

  await sendWhatsAppText({
    to: phone,
    message: getStatusMessage(status, store, order),
  });
}