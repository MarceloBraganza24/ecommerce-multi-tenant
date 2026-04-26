import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { store } = await params;

  const tenant = getTenantBySlug(store);
  if (!tenant) notFound();

  return (
    <div className="innerPage">
      <div className="pageHeader">
        <span className="eyebrow">Nuestra historia</span>
        <h1>Sobre nosotros</h1>
        <p>
          En {tenant.name} creemos en una experiencia de compra simple, cercana
          y segura.
        </p>
      </div>

      <section className="contentCard">
        <h2>Quiénes somos</h2>
        <p>
          Somos una tienda online pensada para ofrecer productos seleccionados,
          buena atención y una experiencia clara desde que elegís un producto
          hasta que recibís tu pedido.
        </p>

        <h2>Nuestro compromiso</h2>
        <p>
          Queremos que cada compra sea fácil, transparente y acompañada. Por eso
          ofrecemos atención personalizada, medios de pago seguros y seguimiento
          de pedidos.
        </p>
      </section>
    </div>
  );
}