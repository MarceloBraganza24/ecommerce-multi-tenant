import type { MongoOrder } from "@/types/store";

export function orderPaidEmailTemplate({
  store,
  order,
}: {
  store: string;
  order: MongoOrder;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const orderUrl = `${siteUrl}/${store}/buscar-pedido?order=${encodeURIComponent(
    order.publicCode
  )}&email=${encodeURIComponent(order.buyer?.email || "")}`;

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
            <strong>${item.title}</strong>
            <br />
            <span style="color:#6b7280;font-size:14px;">
              ${item.talle ? `Talle: ${item.talle}` : ""}
              ${item.color ? ` • Color: ${item.color}` : ""}
              ${item.variantSku ? ` • SKU: ${item.variantSku}` : ""}
            </span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;">
            $${Number(item.unitPrice * item.quantity).toLocaleString("es-AR")}
          </td>
        </tr>
      `
    )
    .join("");

  return `
  <div style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <div style="max-width:640px;margin:0 auto;padding:28px 16px;">
      <div style="background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:#111827;color:white;padding:28px;">
          <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.16em;text-transform:uppercase;color:#d1d5db;">
            Pago confirmado
          </p>
          <h1 style="margin:0;font-size:30px;line-height:1.1;">
            ¡Gracias por tu compra!
          </h1>
        </div>

        <div style="padding:28px;">
          <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
            Hola <strong>${order.buyer?.name || "cliente"}</strong>, recibimos el pago de tu pedido.
          </p>

          <div style="background:#f9fafb;border-radius:18px;padding:18px;margin:22px 0;">
            <p style="margin:0;color:#6b7280;font-size:13px;font-weight:bold;">Número de pedido</p>
            <p style="margin:6px 0 0;font-size:22px;font-weight:900;">${order.publicCode}</p>
          </div>

          <table style="width:100%;border-collapse:collapse;margin-top:20px;">
            <thead>
              <tr>
                <th style="text-align:left;padding-bottom:10px;color:#6b7280;font-size:13px;">Producto</th>
                <th style="text-align:center;padding-bottom:10px;color:#6b7280;font-size:13px;">Cant.</th>
                <th style="text-align:right;padding-bottom:10px;color:#6b7280;font-size:13px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top:22px;border-top:1px solid #e5e7eb;padding-top:18px;">
            <p style="display:flex;justify-content:space-between;margin:0 0 8px;">
              <span>Subtotal</span>
              <strong>$${Number(order.itemsTotal || 0).toLocaleString("es-AR")}</strong>
            </p>

            <p style="display:flex;justify-content:space-between;margin:0 0 8px;">
              <span>Envío</span>
              <strong>$${Number(order.shippingTotal || 0).toLocaleString("es-AR")}</strong>
            </p>

            <p style="display:flex;justify-content:space-between;margin:14px 0 0;font-size:22px;">
              <span>Total</span>
              <strong>$${Number(order.total || 0).toLocaleString("es-AR")}</strong>
            </p>
          </div>

          <div style="text-align:center;margin-top:30px;">
            <a href="${orderUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:15px 24px;border-radius:999px;font-weight:900;">
              Ver pedido
            </a>
          </div>

          <p style="margin:28px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">
            Te vamos a avisar cuando el pedido esté en preparación o sea enviado.
          </p>
        </div>
      </div>

      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:18px;">
        Este email fue generado automáticamente.
      </p>
    </div>
  </div>
  `;
}