import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="pricingPage">
      <div className="saasContainer">
        <div className="pricingHeader">
          <div className="landingBadge">💰 Planes simples y claros</div>

          <h1 className="pricingTitle">Elegí tu plan</h1>

          <p className="pricingSubtitle">
            Empezá gratis y escalá cuando tu tienda crezca.
          </p>
        </div>

        <div className="pricingGrid">
          <div className="pricingCard">
            <h2 className="pricingPlanName">FREE</h2>
            <p className="pricingPlanDescription">Para empezar</p>

            <p className="pricingPrice">$0</p>

            <ul className="pricingList">
              <li>✔ Hasta 10 productos</li>
              <li>✔ Home Builder básico</li>
              <li>✔ Checkout funcional</li>
              <li className="pricingMuted">❌ Export PDF</li>
              <li className="pricingMuted">❌ Dominio personalizado</li>
            </ul>

            <Link href="/create-store" className="saasButton saasButtonSecondary pricingButton">
              Crear tienda gratis
            </Link>
          </div>

          <div className="pricingCard pricingCardPro">
            <span className="recommendedBadge">⭐ RECOMENDADO</span>

            <h2 className="pricingPlanName">PRO 🚀</h2>
            <p className="pricingPlanDescription">Para crecer</p>

            <p className="pricingPrice">$19 / mes</p>

            <ul className="pricingList">
              <li>✔ Productos ilimitados</li>
              <li>✔ Home Builder completo</li>
              <li>✔ Export PDF</li>
              <li>✔ Dominio propio</li>
              <li>✔ Analytics avanzados</li>
            </ul>

            <Link href="/create-store" className="saasButton pricingButton pricingButtonPro">
              Empezar con PRO
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}