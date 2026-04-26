"use client";

import { useMemo, useState } from "react";
import { Product } from "@/types/store";
import { ProductCard } from "./ProductCard";

type Props = {
  products: Product[];
  store: string;
};

export function BrandTabs({ products, store }: Props) {
  const brands = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.brand).filter(Boolean))
    ) as string[];
  }, [products]);

  const [selectedBrand, setSelectedBrand] = useState(brands[0]);

  if (!brands.length) return null;

  const brandProducts = products.filter(
    (product) => product.brand === selectedBrand
  );

  return (
    <section className="brandSection">
      <div className="sectionHeader">
        <h2>Productos por marca</h2>
      </div>

      <div className="brandTabs">
        {brands.map((brand) => (
          <button
            key={brand}
            className={brand === selectedBrand ? "active" : ""}
            onClick={() => setSelectedBrand(brand)}
          >
            {brand}
          </button>
        ))}
      </div>

      <div className="horizontalSlider">
        {brandProducts.map((product) => (
          <div className="sliderItem" key={product._id}>
            <ProductCard product={product} store={store} />
          </div>
        ))}
      </div>
    </section>
  );
}