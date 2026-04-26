import { TenantConfig } from "@/types/store";

type Props = {
  tenant: TenantConfig;
};

export function Footer({ tenant }: Props) {
  return (
    <footer className="storeFooter">
      <div className="footerGrid">
        <div>
          <h3>{tenant.name}</h3>
          <p>
            Tienda online con productos seleccionados, atención personalizada y
            compra segura.
          </p>
        </div>

        <div>
          <h4>Enlaces</h4>
          <div className="footerLinks">
            <a href={`/${tenant.slug}`}>Inicio</a>
            <a href={`/${tenant.slug}/productos`}>Productos</a>
            <a href={`/${tenant.slug}/sobre-nosotros`}>Sobre nosotros</a>
            <a href={`/${tenant.slug}/contacto`}>Contacto</a>
            <a href={`/${tenant.slug}/buscar-pedido`}>Buscar mi pedido</a>
          </div>
        </div>

        <div>
          <h4>Información legal</h4>
          <div className="footerLinks">
            <a href={`/${tenant.slug}/terminos-y-condiciones`}>
              Términos y condiciones
            </a>
            <a href={`/${tenant.slug}/politicas-de-privacidad`}>
              Políticas de privacidad
            </a>
            <a href={`/${tenant.slug}/cambios-y-devoluciones`}>
              Cambios y devoluciones
            </a>
            <a href={`/${tenant.slug}/boton-de-arrepentimiento`}>
              Botón de arrepentimiento
            </a>
          </div>
        </div>

        <div>
          <h4>Redes</h4>
          <div className="footerLinks">
            {tenant.social.instagram && (
              <a href={tenant.social.instagram} target="_blank">
                Instagram
              </a>
            )}

            {tenant.social.facebook && (
              <a href={tenant.social.facebook} target="_blank">
                Facebook
              </a>
            )}

            <a href={`https://wa.me/${tenant.whatsapp}`} target="_blank">
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="footerBottom">
        © {new Date().getFullYear()} {tenant.name}. Todos los derechos reservados.
      </div>
    </footer>
  );
}