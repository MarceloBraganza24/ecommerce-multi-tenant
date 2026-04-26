type CorreoConfig = {
  baseUrl: string;
  username: string;
  password: string;
  customerId: string;
  postalCodeOrigin: string;
};

type CorreoTenant = {
  shipping?: {
    postalCodeOrigin?: string;
    correoArgentino?: {
      baseUrl?: string;
      username?: string;
      password?: string;
      customerId?: string;
    };
  };
};

type CorreoQuoteItem = {
  productId?: string;
  slug?: string;
  quantity: number;
  weight?: number;
  height?: number;
  width?: number;
  length?: number;
};

type CorreoRate = {
  deliveredType?: string;
  productName?: string;
  productType?: string;
  price?: number | string;
  deliveryTimeMin?: number | string;
  deliveryTimeMax?: number | string;
};

type CorreoRatesResponse = {
  rates?: CorreoRate[];
  validTo?: string;
};

type TokenResponse = {
  token?: string;
  expire?: string;
  expires?: string;
};

type TokenCacheEntry = {
  token: string;
  expiresAt: number;
};

const tokenCache = new Map<string, TokenCacheEntry>();

function requireValue(name: string, value?: string) {
  if (!value) throw new Error(`Falta ${name}`);
  return value;
}

function normalizePostalCode(value?: string) {
  return String(value || "").replace(/\D/g, "").slice(0, 4);
}

function normalizeCustomerId(value?: string) {
  const raw = String(value || "").trim();
  const digits = raw.replace(/\D/g, "");

  if (!digits) return raw;

  return digits.padStart(10, "0");
}

function getCacheKey(config: CorreoConfig) {
  return `${config.baseUrl}_${config.username}`;
}

function parseExpireToMs(expire?: string) {
  if (!expire) return 0;

  const normalized = String(expire).replace(" ", "T");
  const ms = new Date(normalized).getTime();

  return Number.isFinite(ms) ? ms : 0;
}

async function getToken(config: CorreoConfig) {
  const key = getCacheKey(config);
  const cached = tokenCache.get(key);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.token;
  }

  const basic = Buffer.from(`${config.username}:${config.password}`).toString(
    "base64"
  );

  const res = await fetch(`${config.baseUrl}/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
    },
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as TokenResponse | null;

  if (!res.ok || !data?.token) {
    throw new Error(`Error obteniendo token Correo Argentino: ${res.status}`);
  }

  const expireMs = parseExpireToMs(data.expire || data.expires);

  tokenCache.set(key, {
    token: data.token,
    expiresAt: expireMs ? expireMs - 60_000 : Date.now() + 14 * 60 * 1000,
  });

  return data.token;
}

function computeCartDimensions(items: CorreoQuoteItem[]) {
  let totalWeight = 0;
  let maxHeight = 0;
  let maxWidth = 0;
  let maxLength = 0;

  for (const item of items) {
    const quantity = Number(item.quantity || 0);

    totalWeight += Number(item.weight || 500) * quantity;
    maxHeight = Math.max(maxHeight, Number(item.height || 10));
    maxWidth = Math.max(maxWidth, Number(item.width || 20));
    maxLength = Math.max(maxLength, Number(item.length || 30));
  }

  return {
    weight: Math.max(Math.round(totalWeight), 500),
    height: Math.max(Math.round(maxHeight), 10),
    width: Math.max(Math.round(maxWidth), 20),
    length: Math.max(Math.round(maxLength), 30),
  };
}

function getCorreoConfig(tenant: CorreoTenant): CorreoConfig {
  const config = tenant.shipping?.correoArgentino;

  return {
    baseUrl: requireValue("baseUrl", config?.baseUrl),
    username: requireValue("username", config?.username),
    password: requireValue("password", config?.password),
    customerId: normalizeCustomerId(requireValue("customerId", config?.customerId)),
    postalCodeOrigin: normalizePostalCode(
      requireValue("postalCodeOrigin", tenant.shipping?.postalCodeOrigin)
    ),
  };
}

function pickBestRate(data: CorreoRatesResponse, deliveredType = "D") {
  const rates = Array.isArray(data.rates) ? data.rates : [];

  return (
    rates.find((rate) => rate.deliveredType === deliveredType) ||
    rates[0] ||
    null
  );
}

export async function quoteCorreoArgentino({
  tenant,
  items,
  postalCodeDestination,
  deliveredType = "D",
}: {
  tenant: CorreoTenant;
  items: CorreoQuoteItem[];
  postalCodeDestination: string;
  deliveredType?: "D" | "S";
}) {
  const config = getCorreoConfig(tenant);
  const token = await getToken(config);

  const postalCodeDestinationNormalized =
    normalizePostalCode(postalCodeDestination);

  if (!postalCodeDestinationNormalized) {
    throw new Error("Código postal de destino inválido");
  }

  const dimensions = computeCartDimensions(items);

  const payload = {
    customerId: config.customerId,
    postalCodeOrigin: config.postalCodeOrigin,
    postalCodeDestination: postalCodeDestinationNormalized,
    deliveredType,
    dimensions,
  };

  const res = await fetch(`${config.baseUrl}/rates`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = (await res.json().catch(() => null)) as CorreoRatesResponse | null;

  if (!res.ok || !data) {
    throw new Error(`Error cotizando Correo Argentino: ${res.status}`);
  }

  const rate = pickBestRate(data, deliveredType);

  if (!rate) {
    throw new Error("Sin tarifas disponibles de Correo Argentino");
  }

  const price = Number(rate.price || 0);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Tarifa inválida de Correo Argentino");
  }

  return {
    provider: "correo_argentino" as const,
    service: rate.productName || rate.productType || "Correo Argentino",
    price,
    eta:
      rate.deliveryTimeMin && rate.deliveryTimeMax
        ? `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días`
        : "A coordinar",
    deliveryType: "shipping" as const,
    postalCodeOrigin: config.postalCodeOrigin,
    postalCodeDestination: postalCodeDestinationNormalized,
    raw: rate,
    validTo: data.validTo || null,
  };
}