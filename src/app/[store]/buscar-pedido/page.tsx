import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";
import { getOrderByPublicCode, getOrderStatusLabel } from "@/lib/orders";
import type { OrderItem } from "@/types/store";

type Props = {
  params: Promise<{ store: string }>;
  searchParams: Promise<{
    order?: string;
    email?: string;
  }>;
};

export default async function SearchOrderPage({ params, searchParams }: Props) {
  const { store } = await params;
  const { order: publicCode, email } = await searchParams;

  const tenant = await getTenantBySlug(store);
  if (!tenant) notFound();

  const foundOrder = publicCode
    ? await getOrderByPublicCode(tenant._id, publicCode)
    : null;

  const emailMatches =
    foundOrder && email
      ? String(foundOrder.buyer?.email || "").toLowerCase() === email.toLowerCase()
      : false;

  const shouldShowOrder = foundOrder && (!email || emailMatches);

  return (
    <div className="innerPage">
      <div className="pageHeader">
        <span className="eyebrow">Seguimiento</span>
        <h1>Buscar mi pedido</h1>
        <p>Consultá el estado usando el número de pedido y el email de compra.</p>
      </div>

      <section className="orderSearchCard contentCard">
        <form className="contactForm">
          <label>
            Número de pedido
            <input
              name="order"
              placeholder="Ej: ORD-ABC123"
              defaultValue={publicCode || ""}
              required
            />
          </label>

          <label>
            Email
            <input
              name="email"
              type="email"
              placeholder="Email usado en la compra"
              defaultValue={email || ""}
            />
          </label>

          <button className="primaryButton" type="submit">
            Consultar estado
          </button>
        </form>

        {publicCode && !foundOrder && (
          <div className="emptyState">
            <h2>No encontramos ese pedido</h2>
            <p>Revisá que el número esté escrito correctamente.</p>
          </div>
        )}

        {foundOrder && email && !emailMatches && (
          <div className="emptyState">
            <h2>El email no coincide</h2>
            <p>Por seguridad, ingresá el email usado en la compra.</p>
          </div>
        )}

        {shouldShowOrder && (
          <div className="orderPublicDetail">
            <h2>Pedido {foundOrder.publicCode}</h2>

            <div className="orderResultBox">
              <div>
                <span>Estado</span>
                <strong>{getOrderStatusLabel(foundOrder.status)}</strong>
              </div>

              <div>
                <span>Total</span>
                <strong>
                  ${Number(foundOrder.total || 0).toLocaleString("es-AR")}
                </strong>
              </div>

              <div>
                <span>Cliente</span>
                <strong>{foundOrder.buyer?.name || "-"}</strong>
              </div>
            </div>

            <h3>Productos</h3>

            <div className="orderItemsList">
              {foundOrder.items?.map((item: OrderItem, index: number) => (
                <article key={`${item.productId}-${item.variantSku}-${index}`}>
                  <div>
                    <strong>{item.title}</strong>
                    <small>
                      {item.talle && `Talle: ${item.talle}`}{" "}
                      {item.color && `• Color: ${item.color}`}
                    </small>
                    <span>Cantidad: {item.quantity}</span>
                  </div>

                  <strong>
                    $
                    {Number(item.unitPrice * item.quantity).toLocaleString(
                      "es-AR"
                    )}
                  </strong>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}