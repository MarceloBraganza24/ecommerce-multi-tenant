"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { trackEvent } from "@/lib/track-event";
import type { DeliveryType, ShippingQuote } from "@/types/store";

type Props = {
  store: string;
};

export function CheckoutForm({ store }: Props) {
  const { items, total } = useCart();
  const [loading, setLoading] = useState(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("shipping");
  const [postalCode, setPostalCode] = useState("");
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const finalTotal = total + Number(quote?.price || 0);

  async function quoteShipping() {
    setQuoteLoading(true);

    try {
      const res = await fetch(`/api/shipping/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store,
          deliveryType,
          postalCodeDestination: postalCode,
          itemsTotal: total,
          items,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo cotizar el envío");
        return;
      }

      setQuote(data.quote);
    } finally {
      setQuoteLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (deliveryType === "shipping" && !quote) {
      alert("Cotizá el envío antes de continuar");
      return;
    }

    const formData = new FormData(event.currentTarget);

    const buyer = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      dni: String(formData.get("dni") || ""),
      address: String(formData.get("address") || ""),
      city: String(formData.get("city") || ""),
      province: String(formData.get("province") || ""),
      postalCode: String(formData.get("postalCode") || ""),
      notes: String(formData.get("notes") || ""),
    };

    setLoading(true);

    try {
      await trackEvent({
        tenantSlug: store,
        event: "begin_checkout",
        value: finalTotal,
        metadata: {
          deliveryType,
          shippingQuote: quote,
          items: items.map((item) => ({
            productId: item.productId,
            variantSku: item.variantSku,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      });

      const res = await fetch(`/${store}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantSku: item.variantSku,
            quantity: item.quantity,
          })),
          buyer,
          shipping: {
            deliveryType,
            postalCode,
            quote,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo iniciar el pago");
        return;
      }

      await trackEvent({
        tenantSlug: store,
        event: "checkout_redirect",
        orderId: data.orderId,
        publicCode: data.publicCode,
        value: finalTotal,
      });

      window.location.href = data.initPoint;
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) {
    return (
      <div className="contentCard">
        <h2>Tu carrito está vacío</h2>
        <p>Agregá productos antes de finalizar la compra.</p>
        <a href={`/${store}/productos`} className="primaryButton">
          Ver productos
        </a>
      </div>
    );
  }

  return (
    <section className="checkoutGrid">
      <form className="contentCard checkoutForm" onSubmit={handleSubmit}>
        <h2>Datos del comprador</h2>

        <label>
          Nombre completo
          <input name="name" required />
        </label>

        <label>
          Email
          <input name="email" type="email" required />
        </label>

        <label>
          Teléfono
          <input name="phone" required />
        </label>

        <label>
          DNI
          <input name="dni" />
        </label>

        <h2>Entrega</h2>

        <div className="deliverySelector">
          <button
            type="button"
            className={deliveryType === "shipping" ? "selected" : ""}
            onClick={() => {
              setDeliveryType("shipping");
              setQuote(null);
            }}
          >
            Envío a domicilio
          </button>

          <button
            type="button"
            className={deliveryType === "pickup" ? "selected" : ""}
            onClick={() => {
              setDeliveryType("pickup");
              setQuote(null);
            }}
          >
            Retiro en local
          </button>
        </div>

        {deliveryType === "shipping" && (
          <>
            <label>
              Código postal
              <input
                name="postalCode"
                required
                value={postalCode}
                onChange={(event) => {
                  setPostalCode(event.target.value);
                  setQuote(null);
                }}
              />
            </label>

            <button
              className="secondaryButton"
              type="button"
              disabled={quoteLoading || !postalCode}
              onClick={quoteShipping}
            >
              {quoteLoading ? "Cotizando..." : "Cotizar envío"}
            </button>
          </>
        )}

        {deliveryType === "pickup" && (
          <button
            className="secondaryButton"
            type="button"
            onClick={quoteShipping}
          >
            Confirmar retiro en local
          </button>
        )}

        {quote && (
          <div className="shippingQuoteBox">
            <strong>{quote.service}</strong>
            <span>{quote.eta || "A coordinar"}</span>
            <b>${Number(quote.price || 0).toLocaleString("es-AR")}</b>
          </div>
        )}

        {deliveryType === "shipping" && (
          <>
            <label>
              Dirección
              <input name="address" required />
            </label>

            <label>
              Ciudad
              <input name="city" required />
            </label>

            <label>
              Provincia
              <input name="province" required />
            </label>
          </>
        )}

        <label>
          Notas
          <textarea name="notes" placeholder="Piso, depto, referencias..." />
        </label>

        <button className="primaryButton fullButton" disabled={loading}>
          {loading ? "Redirigiendo..." : "Pagar con Mercado Pago"}
        </button>
      </form>

      <aside className="contentCard checkoutSummary">
        <h2>Resumen</h2>

        {items.map((item) => (
          <div
            key={`${item.productId}-${item.variantSku || ""}`}
            className="checkoutItem"
          >
            <div>
              <strong>{item.title}</strong>
              <small>
                {item.talle && `Talle: ${item.talle}`}{" "}
                {item.color && `• Color: ${item.color}`}
              </small>
              <span>Cantidad: {item.quantity}</span>
            </div>

            <strong>${(item.price * item.quantity).toLocaleString("es-AR")}</strong>
          </div>
        ))}

        <div className="checkoutTotal soft">
          <span>Productos</span>
          <strong>${total.toLocaleString("es-AR")}</strong>
        </div>

        <div className="checkoutTotal soft">
          <span>Envío</span>
          <strong>${Number(quote?.price || 0).toLocaleString("es-AR")}</strong>
        </div>

        <div className="checkoutTotal">
          <span>Total</span>
          <strong>${finalTotal.toLocaleString("es-AR")}</strong>
        </div>
      </aside>
    </section>
  );
}