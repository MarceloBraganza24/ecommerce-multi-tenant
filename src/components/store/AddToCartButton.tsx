"use client";

import { useCart } from "./CartProvider";
import type { MongoProduct } from "@/types/store";

type Props = {
  product: MongoProduct;
};

export function AddToCartButton({ product }: Props) {
  const { addItem } = useCart();

  return (
    <button
      className="primaryButton fullButton"
      onClick={() =>
        addItem({
          productId: String(product._id),
          title: product.title,
          slug: product.slug,
          price: product.price,
          image: product.images?.[0],
        })
      }
    >
      Agregar al carrito
    </button>
  );
}