"use client";

import { useMemo, useState } from "react";
import { useCart } from "./CartProvider";
import { trackEvent } from "@/lib/track-event";
import type { MongoProduct, ProductVariant } from "@/types/store";

type Props = {
  product: MongoProduct;
  tenantSlug: string;
};

export function ProductVariantSelector({ product, tenantSlug }: Props) {
  const { addItem } = useCart();

  const variants = (product.variants || []).filter(
    (variant) => variant.active !== false && variant.stock > 0
  );

  const colores = useMemo(() => {
    return Array.from(new Set(variants.map((v) => v.color).filter(Boolean)));
  }, [variants]);

  const talles = useMemo(() => {
    return Array.from(new Set(variants.map((v) => v.talle).filter(Boolean)));
  }, [variants]);

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedTalle, setSelectedTalle] = useState<string>("");

  const selectedVariant = variants.find((variant) => {
    const colorOk = selectedColor ? variant.color === selectedColor : true;
    const talleOk = selectedTalle ? variant.talle === selectedTalle : true;
    return colorOk && talleOk;
  });

  const finalPrice = selectedVariant?.price || product.price;
  const image = selectedVariant?.image || product.images?.[0];

  async function handleAdd() {
    if (variants.length && !selectedVariant) {
      alert("Seleccioná una variante disponible");
      return;
    }

    const variant = selectedVariant as ProductVariant | undefined;

    addItem({
      productId: String(product._id),
      variantSku: variant?.sku,
      title: product.title,
      slug: product.slug,
      price: finalPrice,
      image,
      talle: variant?.talle,
      color: variant?.color,
    });

    await trackEvent({
      tenantSlug,
      event: "add_to_cart",
      productId: String(product._id),
      productSlug: product.slug,
      productTitle: product.title,
      value: finalPrice,
      metadata: {
        variantSku: variant?.sku,
        talle: variant?.talle,
        color: variant?.color,
      },
    });
  }

  return (
    <div className="variantSelector">
      {colores.length > 0 && (
        <div className="variantGroup">
          <strong>Color</strong>

          <div className="variantOptions">
            {colores.map((color) => (
              <button
                key={color}
                type="button"
                className={selectedColor === color ? "selected" : ""}
                onClick={() => setSelectedColor(String(color))}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {talles.length > 0 && (
        <div className="variantGroup">
          <strong>Talle</strong>

          <div className="variantOptions">
            {talles.map((talle) => {
              const available = variants.some((variant) => {
                const colorOk = selectedColor
                  ? variant.color === selectedColor
                  : true;

                return colorOk && variant.talle === talle && variant.stock > 0;
              });

              return (
                <button
                  key={talle}
                  type="button"
                  disabled={!available}
                  className={selectedTalle === talle ? "selected" : ""}
                  onClick={() => setSelectedTalle(String(talle))}
                >
                  {talle}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedVariant && (
        <p className="variantStock">Stock disponible: {selectedVariant.stock}</p>
      )}

      <button className="primaryButton fullButton" onClick={handleAdd}>
        Agregar al carrito
      </button>
    </div>
  );
}