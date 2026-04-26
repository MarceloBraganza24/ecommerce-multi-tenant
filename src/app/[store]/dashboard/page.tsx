import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";
import { products } from "@/lib/products";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { store } = await params;

  const tenant = getTenantBySlug(store);
  if (!tenant) notFound();

  const tenantProducts = products.filter((product) => product.tenantSlug === store);

  return (
    <div className="innerPage">
      <div className="pageHeader">
        <span className="eyebrow">Panel interno</span>
        <h1>Dashboard de ventas</h1>
        <p>Resumen general de la tienda {tenant.name}.</p>
      </div>

      <section className="dashboardGrid">
        <article className="dashboardCard">
          <span>Ventas del mes</span>
          <strong>$0</strong>
        </article>

        <article className="dashboardCard">
          <span>Pedidos</span>
          <strong>0</strong>
        </article>

        <article className="dashboardCard">
          <span>Productos activos</span>
          <strong>{tenantProducts.length}</strong>
        </article>

        <article className="dashboardCard">
          <span>Ticket promedio</span>
          <strong>$0</strong>
        </article>
      </section>

      <section className="contentCard">
        <h2>Últimos pedidos</h2>

        <div className="tableWrapper">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Sin pedidos</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}