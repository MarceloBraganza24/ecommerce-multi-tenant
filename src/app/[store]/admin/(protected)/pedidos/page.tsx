import { Order } from "@/models/Order";
import { connectDB } from "@/lib/mongodb";
import { requireTenantAdmin } from "@/lib/adminAuth";
import { getOrderStatusLabel } from "@/lib/orders";
import type { MongoOrder } from "@/types/store";
import { Tenant } from "@/models/Tenant";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function AdminOrdersPage({ params }: Props) {
  const { store } = await params;
  
  await requireTenantAdmin(store);
  
  const tenant = await Tenant.findOne({ slug: store }).lean();

  if (!tenant) {
    notFound();
  }

  const safeTenant = JSON.parse(JSON.stringify(tenant));

  await connectDB();

  const orders = (await Order.find({ tenantId: safeTenant._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()) as unknown as MongoOrder[];

  return (
    <div>
      <div className="adminHeader">
        <div>
          <span className="eyebrow">Pedidos</span>
          <h1>Últimos pedidos</h1>
        </div>
      </div>

      <div className="adminTableCard">
        <table>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Total</th>
              <th>Fecha</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={String(order._id)}>
                <td>{order.publicCode}</td>
                <td>
                  {order.buyer?.name || "-"}
                  <br />
                  <small>{order.buyer?.email || ""}</small>
                </td>
                <td>{getOrderStatusLabel(order.status)}</td>
                <td>${Number(order.total || 0).toLocaleString("es-AR")}</td>
                <td>{new Date(order.createdAt).toLocaleDateString("es-AR")}</td>
                <td>
                  <a
                    className="adminSmallButton"
                    href={`/${store}/admin/pedidos/${order._id}`}
                  >
                    Ver detalle
                  </a>
                </td>
              </tr>
            ))}

            {!orders.length && (
              <tr>
                <td colSpan={6}>Todavía no hay pedidos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}