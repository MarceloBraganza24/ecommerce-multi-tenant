import type { TenantConfig } from "@/types/store";

type Props = {
  tenant: TenantConfig;
};

export function PromoTicker({ tenant }: Props) {
  const enabled = tenant.appearance?.promoBarEnabled !== false;

  if (!enabled) return null;

  const messages =
    tenant.appearance?.promoMessages?.length
      ? tenant.appearance.promoMessages
      : [
          `Envío gratis desde $${tenant.freeShippingFrom?.toLocaleString("es-AR")}`,
          "Pagá seguro",
          "Cambios simples",
        ];

  const repeated = [...messages, ...messages, ...messages];

  return (
    <div className="promoTicker">
      <div className="promoTickerTrack">
        {repeated.map((message, index) => (
          <span key={`${message}-${index}`}>{message}</span>
        ))}
      </div>
    </div>
  );
}