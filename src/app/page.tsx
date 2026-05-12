import Link from "next/link";

export default function Home() {
  return (
    <main className="landingHero">
      <div className="landingBox">
        <div className="landingBadge">
          ✨ Plataforma e-commerce multi-tienda
        </div>

        <h1 className="landingTitle">
          Creá tu tienda online en minutos
        </h1>

        <p className="landingSubtitle">
          Vendé productos, personalizá tu diseño, gestioná pedidos y hacé crecer
          tu negocio desde un admin simple, moderno y profesional.
        </p>

        <div className="landingActions">
          <Link href="/create-store" className="saasButton">
            Crear tienda gratis
          </Link>

          <Link href="/pricing" className="saasButton saasButtonSecondary">
            Ver planes
          </Link>
        </div>

        <div className="landingGrid">
          <div className="landingFeature saasCard">
            <div className="landingFeatureIcon">🛍️</div>
            <h3>Tienda lista para vender</h3>
            <p>
              Catálogo, productos, checkout, pedidos y diseño adaptable para
              cualquier rubro.
            </p>
          </div>

          <div className="landingFeature saasCard">
            <div className="landingFeatureIcon">🎨</div>
            <h3>Diseño personalizable</h3>
            <p>
              Editá la home, colores, secciones, preguntas frecuentes y footer
              sin tocar código.
            </p>
          </div>

          <div className="landingFeature saasCard">
            <div className="landingFeatureIcon">🤖</div>
            <h3>Impulsado con IA</h3>
            <p>
              Generá textos, estructura y secciones para tu tienda a partir de
              una descripción simple.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}