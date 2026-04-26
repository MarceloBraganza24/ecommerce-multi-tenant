import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function getOrderByPublicCode(tenantId: string, publicCode: string) {
  await connectDB();

  const order = await Order.findOne({
    tenantId,
    publicCode,
  }).lean();

  if (!order) return null;

  return JSON.parse(JSON.stringify(order));
}

export function getOrderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: "Pendiente de pago",
    paid: "Pago confirmado",
    preparing: "En preparación",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
    failed: "Pago fallido",
  };

  return labels[status] || status;
}