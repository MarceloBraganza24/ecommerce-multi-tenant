import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function OrdersPage({ params }: Props) {
  const { store } = await params;

  const tenant = getTenantBySlug(store);
  if (!tenant) notFound();

  return (
    <div className="innerPage">
      <div className="pageHeader">
        <span className="eyebrow">Pedidos</span>
        <h1>Mis pedidos</h1>
        <p>Ingresá tus datos para consultar compras realizadas en {tenant.name}.</p>
      </div>

      <section className="contentCard">
        <form className="contactForm">
          <label>
            Email usado en la compra
            <input type="email" placeholder="tu@email.com" />
          </label>

          <label>
            Número de pedido
            <input placeholder="Ej: ORD-0001" />
          </label>

          <button className="primaryButton" type="submit">
            Buscar pedidos
          </button>
        </form>
      </section>
    </div>
  );
}