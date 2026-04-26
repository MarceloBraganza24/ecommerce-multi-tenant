import { connectDB } from "@/lib/mongodb";
import { requireTenantAdmin } from "@/lib/admin-session";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function AdminDashboardPage({ params }: Props) {
  const { store } = await params;
  const { tenant } = await requireTenantAdmin(store);

  await connectDB();

  const [productsCount, ordersCount, paidOrders] = await Promise.all([
    Product.countDocuments({ tenantId: tenant._id, active: true }),
    Order.countDocuments({ tenantId: tenant._id }),
    Order.find({ tenantId: tenant._id, status: "paid" }).lean(),
  ]);

  const revenue = paidOrders.reduce(
    (acc, order) => acc + Number(order.total || 0),
    0
  );

  const avgTicket = paidOrders.length ? revenue / paidOrders.length : 0;

  return (
    <div>
      <div className="adminHeader">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Resumen de ventas</h1>
        </div>
      </div>

      <section className="adminStatsGrid">
        <article>
          <span>Ventas pagadas</span>
          <strong>${revenue.toLocaleString("es-AR")}</strong>
        </article>

        <article>
          <span>Pedidos totales</span>
          <strong>{ordersCount}</strong>
        </article>

        <article>
          <span>Productos activos</span>
          <strong>{productsCount}</strong>
        </article>

        <article>
          <span>Ticket promedio</span>
          <strong>${Math.round(avgTicket).toLocaleString("es-AR")}</strong>
        </article>
      </section>
    </div>
  );
}