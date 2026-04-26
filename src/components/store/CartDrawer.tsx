"use client";

import { useCart } from "./CartProvider";
//import { trackEvent } from "@/lib/track-event";

type Props = {
  store: string;
};

export function CartDrawer({ store }: Props) {
  const {
    items,
    hydrated,
    isOpen,
    closeCart,
    increaseItem,
    decreaseItem,
    removeItem,
    total,
  } = useCart();

  /* async function handleCheckout() {
    try {
      await trackEvent({
        tenantSlug: store,
        event: "begin_checkout",
        value: total,
        metadata: {
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
          buyer: {},
        }),
      });

      const data = await res.json();

      await trackEvent({
        tenantSlug: store,
        event: "checkout_redirect",
        orderId: data.orderId,
        publicCode: data.publicCode,
        value: total,
      });

      window.location.href = data.initPoint;
    } catch (error) {
      console.error(error);
    }
  } */

  return (
    <aside className={`cartDrawerOverlay ${isOpen ? "open" : ""}`}>
      <div className="cartDrawer">
        <div className="cartHeader">
          <h2>Carrito</h2>
          <button onClick={closeCart}>×</button>
        </div>

        {!hydrated ? null : !items.length ? (
          <div className="emptyCart">
            <p>Tu carrito está vacío.</p>
          </div>
        ) : (
          <>
            <div className="cartItems">
              {items.map((item) => (
                <article
                  key={`${item.productId}-${item.variantSku || ""}`}
                  className="cartItem"
                >
                  <div>
                    <strong>{item.title}</strong>

                    {(item.talle || item.color) && (
                      <small>
                        {item.talle && `Talle: ${item.talle}`}{" "}
                        {item.color && `• Color: ${item.color}`}
                      </small>
                    )}

                    <span>
                      ${item.price.toLocaleString("es-AR")}
                    </span>
                  </div>

                  <div className="cartItemActions">
                    <button
                      onClick={() =>
                        decreaseItem(item.productId, item.variantSku)
                      }
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        increaseItem(item.productId, item.variantSku)
                      }
                    >
                      +
                    </button>

                    <button
                      onClick={() =>
                        removeItem(item.productId, item.variantSku)
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="cartFooter">
              <div className="cartTotal">
                <span>Total</span>
                <strong>
                  ${total.toLocaleString("es-AR")}
                </strong>
              </div>

              <a className="primaryButton fullButton" href={`/${store}/checkout`}>
                Finalizar compra
              </a>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}