import { notFound } from "next/navigation";
import { Order } from "@/models/Order";
import { connectDB } from "@/lib/mongodb";
import { requireTenantAdmin } from "@/lib/admin-session";
import { getOrderStatusLabel } from "@/lib/orders";
import { updateOrderStatusAction } from "../../actions";
import type { MongoOrder, OrderStatus } from "@/types/store";

type Props = {
  params: Promise<{
    store: string;
    id: string;
  }>;
};

const statuses: OrderStatus[] = [
  "pending",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
];

export default async function AdminOrderDetailPage({ params }: Props) {
  const { store, id } = await params;

  const { tenant } = await requireTenantAdmin(store);
  await connectDB();

  const order = (await Order.findOne({
    _id: id,
    tenantId: tenant._id,
  }).lean()) as unknown as MongoOrder | null;

  if (!order) notFound();

  return (
    <div>
      <div className="adminHeader">
        <div>
          <span className="eyebrow">Pedido</span>
          <h1>{order.publicCode}</h1>
        </div>

        <a className="adminPrimaryButton" href={`/${store}/admin/pedidos`}>
          Volver
        </a>
      </div>

      <section className="adminOrderGrid">
        <article className="adminTableCard adminOrderCard">
          <h2>Estado y envío</h2>

          <form
            className="adminStatusForm"
            action={updateOrderStatusAction.bind(null, store, String(order._id))}
          >
            <label>
              Estado
              <select name="status" defaultValue={order.status}>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {getOrderStatusLabel(status)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Transporte / Correo
              <input
                name="shippingCarrier"
                defaultValue={order.shippingCarrier || ""}
                placeholder="Ej: Correo Argentino"
              />
            </label>

            <label>
              Método de envío
              <input
                name="shippingMethod"
                defaultValue={order.shippingMethod || ""}
                placeholder="Ej: Domicilio / Retiro"
              />
            </label>

            <label>
              Número de seguimiento
              <input
                name="trackingNumber"
                defaultValue={order.trackingNumber || ""}
                placeholder="Ej: 000123456789"
              />
            </label>

            <label>
              Notas de envío
              <textarea
                name="shippingNotes"
                defaultValue={order.shippingNotes || ""}
                placeholder="Notas internas o información para el cliente"
              />
            </label>

            <button className="adminPrimaryButton" type="submit">
              Guardar y notificar si cambió el estado
            </button>
          </form>
        </article>

        <article className="adminTableCard adminOrderCard">
          <h2>Cliente</h2>

          <div className="adminInfoList">
            <div>
              <span>Nombre</span>
              <strong>{order.buyer?.name || "-"}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{order.buyer?.email || "-"}</strong>
            </div>

            <div>
              <span>Teléfono</span>
              <strong>{order.buyer?.phone || "-"}</strong>
            </div>

            <div>
              <span>DNI</span>
              <strong>{order.buyer?.dni || "-"}</strong>
            </div>
          </div>
        </article>

        <article className="adminTableCard adminOrderCard">
          <h2>Entrega</h2>

          <div className="adminInfoList">
            <div>
              <span>Dirección</span>
              <strong>{order.buyer?.address || "-"}</strong>
            </div>

            <div>
              <span>Ciudad</span>
              <strong>{order.buyer?.city || "-"}</strong>
            </div>

            <div>
              <span>Provincia</span>
              <strong>{order.buyer?.province || "-"}</strong>
            </div>

            <div>
              <span>Código postal</span>
              <strong>{order.buyer?.postalCode || "-"}</strong>
            </div>

            <div>
              <span>Notas</span>
              <strong>{order.buyer?.notes || "-"}</strong>
            </div>
          </div>
        </article>

        <article className="adminTableCard adminOrderCard">
          <h2>Resumen</h2>

          <div className="adminInfoList">
            <div>
              <span>Subtotal</span>
              <strong>${Number(order.itemsTotal || 0).toLocaleString("es-AR")}</strong>
            </div>

            <div>
              <span>Envío</span>
              <strong>${Number(order.shippingTotal || 0).toLocaleString("es-AR")}</strong>
            </div>

            <div>
              <span>Total</span>
              <strong>${Number(order.total || 0).toLocaleString("es-AR")}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="adminTableCard adminOrderCard">
        <h2>Productos</h2>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Variante</th>
              <th>Cantidad</th>
              <th>Unitario</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item, index) => (
              <tr key={`${item.productId}-${item.variantSku}-${index}`}>
                <td>{item.title}</td>
                <td>
                  {item.talle && `Talle: ${item.talle}`}{" "}
                  {item.color && `• Color: ${item.color}`}
                  {!item.talle && !item.color && "-"}
                </td>
                <td>{item.quantity}</td>
                <td>${Number(item.unitPrice || 0).toLocaleString("es-AR")}</td>
                <td>
                  ${Number(item.unitPrice * item.quantity).toLocaleString("es-AR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}