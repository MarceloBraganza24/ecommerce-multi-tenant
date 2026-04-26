import { Product } from "@/types/store";
import { ProductCard } from "./ProductCard";

type Props = {
  title: string;
  products: Product[];
  store: string;
};

export function ProductSlider({ title, products, store }: Props) {
  if (!products.length) return null;

  return (
    <section className="productSection">
      <div className="sectionHeader">
        <h2>{title}</h2>
        <a href={`/${store}/productos`}>Ver todos</a>
      </div>

      <div className="horizontalSlider">
        {products.map((product) => (
          <div className="sliderItem" key={product._id}>
            <ProductCard product={product} store={store} />
          </div>
        ))}
      </div>
    </section>
  );
}