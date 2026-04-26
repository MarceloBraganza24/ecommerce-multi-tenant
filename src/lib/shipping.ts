import type { ShippingQuote } from "@/types/store";
import { quoteCorreoArgentino } from "@/lib/correo-argentino";
import { saveShippingSample, getEstimatedShippingQuote } from "@/lib/shipping-intelligence";

type CartItemForShipping = {
  productId?: string;
  quantity: number;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
};

type TenantShippingConfig = {
  freeFrom?: number;
  flatRate?: number;
  localPickupEnabled?: boolean;
  localPickupLabel?: string;
  postalCodeOrigin?: string;
  provider?: "flat" | "correo_argentino" | "andreani";
  correoArgentino?: {
    baseUrl?: string;
    username?: string;
    password?: string;
    customerId?: string;
  };
  andreani?: {
    baseUrl?: string;
    username?: string;
    password?: string;
    clientId?: string;
    contract?: string;
  };
};

type TenantLike = {
  _id?: string;
  freeShippingFrom?: number;
  shipping?: TenantShippingConfig;
};

type QuoteArgs = {
  tenant: TenantLike;
  itemsTotal: number;
  items: CartItemForShipping[]; // 🔥 AGREGADO
  postalCodeDestination?: string;
  deliveryType: "pickup" | "shipping";
};

export async function getShippingQuote({
  tenant,
  itemsTotal,
  items,
  postalCodeDestination,
  deliveryType,
}: QuoteArgs): Promise<ShippingQuote> {
  const shipping = tenant.shipping || {};
  const freeFrom = Number(shipping.freeFrom || tenant.freeShippingFrom || 0);

  // 🟢 RETIRO
  if (deliveryType === "pickup") {
    return {
      provider: "local",
      service: shipping.localPickupLabel || "Retiro en local",
      price: 0,
      deliveryType: "pickup",
      postalCodeOrigin: shipping.postalCodeOrigin,
      postalCodeDestination,
    };
  }

  if (!postalCodeDestination) {
    throw new Error("Falta código postal de destino");
  }

  // 🟢 ENVÍO GRATIS
  if (freeFrom > 0 && itemsTotal >= freeFrom) {
    return {
      provider: "flat",
      service: "Envío gratis",
      price: 0,
      eta: "A coordinar",
      deliveryType: "shipping",
      postalCodeOrigin: shipping.postalCodeOrigin,
      postalCodeDestination,
    };
  }

  // 🟢 CORREO ARGENTINO
  if (shipping.provider === "correo_argentino") {
    try {
      const quote = await quoteCorreoArgentino({
        tenant,
        items,
        postalCodeDestination,
      });

      if (tenant._id) {
        await saveShippingSample({
          tenantId: String(tenant._id),
          quote,
          items,
        });
      }

      return quote;
    } catch {
      if (tenant._id) {
        const estimated = await getEstimatedShippingQuote({
          tenantId: String(tenant._id),
          provider: "correo_argentino",
          postalCodeOrigin: shipping.postalCodeOrigin,
          postalCodeDestination,
          items,
        });

        if (estimated) return estimated;
      }

      return fallbackQuote(
        tenant,
        postalCodeDestination,
        "Correo Argentino no disponible"
      );
    }
  }

  // 🟢 ANDREANI
  if (shipping.provider === "andreani") {
    return await quoteAndreani({
      tenant,
      items, // 👈 opcional pero ya lo dejamos preparado
      postalCodeDestination,
    });
  }

  // 🟢 FALLBACK
  return {
    provider: "flat",
    service: "Envío a domicilio",
    price: Number(shipping.flatRate || 0),
    eta: "A coordinar",
    deliveryType: "shipping",
    postalCodeOrigin: shipping.postalCodeOrigin,
    postalCodeDestination,
  };
}

async function quoteAndreani({
  tenant,
  postalCodeDestination,
}: {
  tenant: TenantLike;
  items: CartItemForShipping[];
  postalCodeDestination: string;
}): Promise<ShippingQuote> {
  const shipping = tenant.shipping || {};
  const config = shipping.andreani;

  if (!config?.baseUrl || !config?.username || !config?.password) {
    return fallbackQuote(
      tenant,
      postalCodeDestination,
      "Andreani no configurado"
    );
  }

  try {
    const loginRes = await fetch(`${config.baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario: config.username,
        password: config.password,
      }),
    });

    if (!loginRes.ok) {
      return fallbackQuote(
        tenant,
        postalCodeDestination,
        "Andreani login falló"
      );
    }

    const loginData = await loginRes.json();
    const token = loginData.token || loginData.access_token;

    const quoteRes = await fetch(`${config.baseUrl}/cotizar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contrato: config.contract,
        codigoPostalOrigen: shipping.postalCodeOrigin,
        codigoPostalDestino: postalCodeDestination,
        peso: 1000,
        volumen: 8000,
      }),
    });

    if (!quoteRes.ok) {
      return fallbackQuote(
        tenant,
        postalCodeDestination,
        "Andreani cotización falló"
      );
    }

    const data = await quoteRes.json();
    const firstRate = Array.isArray(data.tarifas)
      ? data.tarifas[0]
      : data;

    return {
      provider: "andreani",
      service: firstRate.descripcion || "Andreani",
      price: Number(firstRate.tarifaConIva || firstRate.precio || 0),
      eta: firstRate.plazoEntrega || "A coordinar",
      deliveryType: "shipping",
      postalCodeOrigin: shipping.postalCodeOrigin,
      postalCodeDestination,
    };
  } catch {
    return fallbackQuote(
      tenant,
      postalCodeDestination,
      "Error Andreani"
    );
  }
}

function fallbackQuote(
  tenant: TenantLike,
  postalCodeDestination: string,
  reason: string
): ShippingQuote {
  const shipping = tenant.shipping || {};

  return {
    provider: "flat",
    service: `Envío a domicilio (${reason})`,
    price: Number(shipping.flatRate || 0),
    eta: "A coordinar",
    deliveryType: "shipping",
    postalCodeOrigin: shipping.postalCodeOrigin,
    postalCodeDestination,
  };
}