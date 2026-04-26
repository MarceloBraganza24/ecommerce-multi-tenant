import { getOrderStatusLabel } from "@/lib/orders";

type Props = {
  store: string;
  title: string;
  message: string;
  order?: {
    publicCode: string;
    status: string;
    total: number;
  } | null;
};

export function CheckoutResult({ store, title, message, order }: Props) {
  return (
    <div className="innerPage">
      <section className="contentCard checkoutResultCard">
        <span className="eyebrow">Pedido</span>
        <h1>{title}</h1>
        <p>{message}</p>

        {order && (
          <div className="orderResultBox">
            <div>
              <span>Número de pedido</span>
              <strong>{order.publicCode}</strong>
            </div>

            <div>
              <span>Estado</span>
              <strong>{getOrderStatusLabel(order.status)}</strong>
            </div>

            <div>
              <span>Total</span>
              <strong>${Number(order.total || 0).toLocaleString("es-AR")}</strong>
            </div>
          </div>
        )}

        <div className="heroActions">
          <a className="primaryButton" href={`/${store}/buscar-pedido`}>
            Buscar mi pedido
          </a>

          <a className="secondaryButton" href={`/${store}/productos`}>
            Seguir comprando
          </a>
        </div>
      </section>
    </div>
  );
}