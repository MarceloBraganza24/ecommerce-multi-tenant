import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function ContactPage({ params }: Props) {
  const { store } = await params;

  const tenant = getTenantBySlug(store);
  if (!tenant) notFound();

  return (
    <div className="innerPage">
      <div className="pageHeader">
        <span className="eyebrow">Contacto</span>
        <h1>Hablemos</h1>
        <p>Consultanos por productos, envíos, pagos o el estado de tu pedido.</p>
      </div>

      <section className="contactGrid">
        <div className="contentCard">
          <h2>Atención por WhatsApp</h2>
          <p>
            Escribinos y te ayudamos a elegir el producto ideal o resolver tus
            dudas.
          </p>

          <a
            className="primaryButton"
            href={`https://wa.me/${tenant.whatsapp}`}
            target="_blank"
          >
            Escribir por WhatsApp
          </a>
        </div>

        <form className="contentCard contactForm">
          <h2>Formulario de contacto</h2>

          <label>
            Nombre
            <input name="name" placeholder="Tu nombre" />
          </label>

          <label>
            Email
            <input name="email" type="email" placeholder="tu@email.com" />
          </label>

          <label>
            Mensaje
            <textarea name="message" placeholder="Escribí tu consulta..." />
          </label>

          <button className="primaryButton" type="submit">
            Enviar consulta
          </button>
        </form>
      </section>
    </div>
  );
}